""" Lyft API functions for finding the best fare for a given location and for cost estimates. """
from math import radians, sin, cos, sqrt, atan2
import random
import math
import string
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from fastapi import APIRouter, HTTPException, Query
from .models import PriceEstimate, LyftCostEstimate, LyftCostEstimatesResponse
from .config import GMAP_API_KEY

router = APIRouter()

EARTH_RADIUS = 6378137
LYFT_COST_URL = "/api/lyft/cost"

# Fake Lyft products
LYFT_PRODUCTS = [
    {"display_name": "Lyft", "base_fare": 5.0, "per_km": 2.0, "product_id": "lyft_standard"},
    {"display_name": "Lyft XL", "base_fare": 7.0, "per_km": 3.0, "product_id": "lyft_xl"},
    {"display_name": "Lyft Lux", "base_fare": 10.0, "per_km": 4.0, "product_id": "lyft_lux"},
]

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate the great circle distance between two points on the Earth (in kilometers)."""
    r = 6371.0  # Earth radius in kilometers
    lat1_rad = radians(lat1)
    lon1_rad = radians(lon1)
    lat2_rad = radians(lat2)
    lon2_rad = radians(lon2)
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    a = sin(dlat/2)**2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return r * c

def get_lyft_cost_estimates(start_lat, start_lon, end_lat, end_lon, ride_type="lyft_standard"):
    """
    Queries the mock Lyft /cost API to get ride cost estimates.
    """
    params = {
        "ride_type": ride_type,
        "start_lat": start_lat,
        "start_lng": start_lon,
        "end_lat": end_lat,
        "end_lng": end_lon,
    }
    
    response = requests.get(LYFT_COST_URL, params=params, timeout=10)
    
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.json())
    
    return response.json().get("cost_estimates", [])

def move_location(lat, lon, meters, direction):
    """
    Moves a latitude/longitude coordinate by a given number of meters in the specified direction.
    """
    delta_lat = (meters / EARTH_RADIUS) * (180 / math.pi)
    delta_lon = (meters / EARTH_RADIUS) * (180 / math.pi) / cos(radians(lat))
    directions = {
        "N": (lat + delta_lat, lon),
        "S": (lat - delta_lat, lon),
        "E": (lat, lon + delta_lon),
        "W": (lat, lon - delta_lon),
        "NE": (lat + delta_lat, lon + delta_lon),
        "NW": (lat + delta_lat, lon - delta_lon),
        "SE": (lat - delta_lat, lon + delta_lon),
        "SW": (lat - delta_lat, lon - delta_lon),
    }
    return directions.get(direction, (lat, lon))

def is_valid_street(lat, lon):
    """
    Uses Google Maps Reverse Geocoding API to check if the coordinates correspond to a valid street.
    """
    if not GMAP_API_KEY:
        return True

    url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lon}&key={GMAP_API_KEY}"
    response = requests.get(url, timeout=10).json()
    for result in response.get("results", []):
        if "route" in result.get("types", []):
            return True
    return False


def process_location(location, end_lat, end_lon):
    """
    Checks if a given location is valid and retrieves Lyft cost estimates.
    Returns a tuple of (label, prices) if valid, or None otherwise.
    """
    lat, lon, label = location
    if is_valid_street(lat, lon):
        prices = get_lyft_cost_estimates(lat, lon, end_lat, end_lon)
        return (label, prices)
    return None

def find_best_fare(start_lat, start_lon, end_lat, end_lon):
    """
    Finds the best Lyft fare by checking the original location and several
    nearby pickup spots in parallel.
    """
    # Generate a list of nearby pickup locations (300ft and 500ft offsets in various directions)
    locations = [
        (start_lat, start_lon, "Original"),
        move_location(start_lat, start_lon, 91, "N") + ("N 300ft",),
        move_location(start_lat, start_lon, 152, "N") + ("N 500ft",),
        move_location(start_lat, start_lon, 91, "E") + ("E 300ft",),
        move_location(start_lat, start_lon, 152, "E") + ("E 500ft",),
        move_location(start_lat, start_lon, 91, "S") + ("S 300ft",),
        move_location(start_lat, start_lon, 152, "S") + ("S 500ft",),
        move_location(start_lat, start_lon, 91, "W") + ("W 300ft",),
        move_location(start_lat, start_lon, 152, "W") + ("W 500ft",),
        move_location(start_lat, start_lon, 91, "NE") + ("NE 300ft",),
        move_location(start_lat, start_lon, 152, "NE") + ("NE 500ft",),
        move_location(start_lat, start_lon, 91, "NW") + ("NW 300ft",),
        move_location(start_lat, start_lon, 152, "NW") + ("NW 500ft",),
        move_location(start_lat, start_lon, 91, "SE") + ("SE 300ft",),
        move_location(start_lat, start_lon, 152, "SE") + ("SE 500ft",),
        move_location(start_lat, start_lon, 91, "SW") + ("SW 300ft",),
        move_location(start_lat, start_lon, 152, "SW") + ("SW 500ft",),
    ]
    
    best_price = None
    best_location = None
    best_ride_type = None

    # Use a thread pool to process locations concurrently
    with ThreadPoolExecutor(max_workers=len(locations)) as executor:
        futures = [executor.submit(process_location, loc, end_lat, end_lon) for loc in locations]
        for future in as_completed(futures):
            result = future.result()
            if result is None:
                continue
            label, prices = result
            for ride in prices:
                # Convert cents to dollars for comparison
                price = ride.get("estimated_cost_cents_min") / 100.0
                ride_type = ride.get("display_name")
                if best_price is None or (price is not None and price < best_price):
                    best_price = price
                    best_location = label
                    best_ride_type = ride_type

    return {
        "best_location": best_location,
        "best_price": best_price,
        "best_ride_type": best_ride_type
    }

def random_offset(lat, lon, max_offset=400):
    """
    Generates a random location within max_offset feet of the given coordinates.
    """
    meters = random.uniform(0, max_offset * 0.3048)  # convert feet to meters
    angle = random.uniform(0, 360)
    delta_lat = (meters / EARTH_RADIUS) * (180 / math.pi)
    delta_lon = delta_lat / cos(radians(lat))
    new_lat = lat + delta_lat * math.sin(math.radians(angle))
    new_lon = lon + delta_lon * math.cos(math.radians(angle))
    return round(new_lat, 6), round(new_lon, 6)

@router.get("/best-lyft-fare/")
def get_best_lyft_fare(start_lat: float, start_lon: float, end_lat: float, end_lon: float):
    """
    API Endpoint to find the best Lyft fare by checking multiple nearby pickup locations.
    """
    try:
        best_fare = find_best_fare(start_lat, start_lon, end_lat, end_lon)
        return best_fare
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

def generate_token() -> str:
    """Generate a fake token string."""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=20))

@router.get("/cost", response_model=LyftCostEstimatesResponse)
def get_lyft_cost_estimates_endpoint(
    ride_type: str = Query(..., description="ID of a ride type"),
    start_lat: float = Query(..., description="Latitude of the starting location"),
    start_lng: float = Query(..., description="Longitude of the starting location"),
    end_lat: float = Query(..., description="Latitude of the ending location"),
    end_lng: float = Query(..., description="Longitude of the ending location")
):
    """
    Fake Lyft cost estimates endpoint that mimics the real Lyft API.
    """
    # Filter product based on ride_type
    matching_products = [p for p in LYFT_PRODUCTS if p["product_id"] == ride_type]
    if not matching_products:
        raise HTTPException(status_code=400, detail="Invalid ride_type provided")
    product = matching_products[0]

    # Calculate distance in kilometers and convert to miles
    distance_km = haversine_distance(start_lat, start_lng, end_lat, end_lng)
    distance_miles = distance_km * 0.621371

    # Calculate fake fare in dollars
    cost_dollars = product["base_fare"] + (product["per_km"] * distance_km)
    low_estimate = cost_dollars + random.uniform(-0.5, 0.5)
    high_estimate = low_estimate * random.uniform(1.05, 1.2)
    estimated_cost_cents_min = round(low_estimate * 100)
    estimated_cost_cents_max = round(high_estimate * 100)

    # Estimate duration using an assumed average speed
    average_speed_mph = 30
    estimated_duration_seconds = round(distance_miles / average_speed_mph * 3600)

    token = generate_token()
    cost_estimate = LyftCostEstimate(
        cost_token=token,
        display_name=product["display_name"],
        estimated_cost_cents_min=estimated_cost_cents_min,
        estimated_cost_cents_max=estimated_cost_cents_max,
        estimated_distance_miles=round(distance_miles, 1),
        estimated_duration_seconds=estimated_duration_seconds,
        is_valid_estimate=True,
        primetime_confirmation_token=token,
        primetime_percentage="25%",
        ride_type=product["product_id"]
    )

    return LyftCostEstimatesResponse(cost_estimates=[cost_estimate])
