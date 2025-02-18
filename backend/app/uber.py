""" Uber API functions for finding the best fare for a given location. """
import math
import random
import requests
from fastapi import APIRouter, HTTPException
from .config import UBER_CLIENT_ID, UBER_CLIENT_SECRET, GMAP_API_KEY

router = APIRouter()

# Uber API URLs
UBER_TOKEN_URL = "https://auth.uber.com/oauth/v2/token"
UBER_ESTIMATE_URL = "https://api.uber.com/v1.2/estimates/price"
MOCK_ESTIMATE_URL = "http://localhost:8000/estimates/price"

USE_GOOGLE_MAPS = True  # Use Google Maps API for reverse geocoding

if GMAP_API_KEY is None:
    USE_GOOGLE_MAPS = False

# Earth's radius in meters
EARTH_RADIUS = 6378137

@router.get("/best-uber-fare/")
def get_best_uber_fare(start_lat: float, start_lon: float, end_lat: float, end_lon: float):
    """
    API Endpoint to find the best Uber fare by checking multiple nearby locations.
    """
    try:
        best_fare = find_best_fare(start_lat, start_lon, end_lat, end_lon)
        return best_fare
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

# Currently Unused
def get_uber_access_token():
    """
    Fetches an OAuth access token for Uber API using Client Credentials.
    Uber API does NOT support scope for Client Credentials Grant.
    """
    data = {
        "client_id": UBER_CLIENT_ID,
        "client_secret": UBER_CLIENT_SECRET,
        "grant_type": "client_credentials"
    }

    headers = {"Content-Type": "application/x-www-form-urlencoded"}

    response = requests.post(UBER_TOKEN_URL, data=data, headers=headers, timeout=10)

    if response.status_code == 200:
        return response.json()["access_token"]

    raise HTTPException(
        status_code=500,
        detail=f"Failed to get Uber access token: {response.json()}"
    )

def move_location(lat, lon, meters, direction):
    """
    Moves a latitude/longitude coordinate by a given number of meters
    in a specified direction (N, S, E, W, NE, NW, SE, SW).
    """
    delta_lat = (meters / EARTH_RADIUS) * (180 / math.pi)
    delta_lon = (meters / EARTH_RADIUS) * (180 / math.pi) / math.cos(math.radians(lat))

    direction_map = {
        "N": (lat + delta_lat, lon),
        "S": (lat - delta_lat, lon),
        "E": (lat, lon + delta_lon),
        "W": (lat, lon - delta_lon),
        "NE": (lat + delta_lat, lon + delta_lon),
        "NW": (lat + delta_lat, lon - delta_lon),
        "SE": (lat - delta_lat, lon + delta_lon),
        "SW": (lat - delta_lat, lon - delta_lon),
    }

    return direction_map.get(direction, (lat, lon))


def is_valid_street(lat, lon):
    """
    Checks if the given latitude/longitude corresponds to a valid street address.
    Uses Google Maps Reverse Geocoding API.
    """
    if not USE_GOOGLE_MAPS:
        return True

    url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lon}&key={GMAP_API_KEY}"
    response = requests.get(url, timeout=10).json()

    for result in response.get("results", []):
        print(result)
        if "route" in result.get("types", []):  # "route" type indicates a valid street
            return True
    return False


def get_uber_price_estimates(start_lat, start_lon, end_lat, end_lon):
    """
    Queries the mock API to get ride price estimates between the start and end locations.
    """
    params = {
        "start_latitude": start_lat,
        "start_longitude": start_lon,
        "end_latitude": end_lat,
        "end_longitude": end_lon,
        "seat_count": 1
    }

    response = requests.get(MOCK_ESTIMATE_URL, params=params, timeout=10)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.json())

    return response.json().get("prices", [])


def find_best_fare(start_lat, start_lon, end_lat, end_lon):
    """
    Finds the best Uber fare by checking the original location
    and valid nearby locations (300ft & 500ft in 8 directions).
    """
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

    for lat, lon, label in locations:
        if is_valid_street(lat, lon):
            prices = get_uber_price_estimates(lat, lon, end_lat, end_lon)

            for ride in prices:
                price = ride.get("low_estimate")
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
    meters = random.uniform(0, max_offset * 0.3048)  # Convert feet to meters
    angle = random.uniform(0, 360)  # Random direction
    delta_lat = (meters / EARTH_RADIUS) * (180 / math.pi)
    delta_lon = delta_lat / math.cos(math.radians(lat))

    new_lat = lat + delta_lat * math.sin(math.radians(angle))
    new_lon = lon + delta_lon * math.cos(math.radians(angle))

    return round(new_lat, 6), round(new_lon, 6)


# Temporary endpoint for testing
@router.get("/best-uber-fare-test/")
def get_fake_uber_fare(start_lat: float, start_lon: float):
    """
    Returns a fake 'best' ride estimate.
    """
    best_pickup_lat, best_pickup_lon = random_offset(start_lat, start_lon)
    fake_price = round(random.uniform(10, 50), 2)  # Fake price between $10 - $50
    ride_type = random.choice(["UberX", "UberXL", "Comfort", "Black"])

    return {
        "best_pickup_location": {"latitude": best_pickup_lat, "longitude": best_pickup_lon},
        "estimated_price": fake_price,
        "ride_type": ride_type
    }
