""" Uber API functions for finding the best fare for a given location. """
import math
import requests
from uber_rides.session import Session
from uber_rides.client import UberRidesClient
from fastapi import APIRouter, HTTPException
from .config import UBER_SERVER_TOKEN
from .config import GOOGLE_MAPS_API_KEY

router = APIRouter()

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

def move_location(lat, lon, meters, direction):
    """
    Moves a latitude/longitude coordinate by a given number of meters
    in a specified direction (N, S, E, W, NE, NW, SE, SW).
    """
    delta_lat = (meters / EARTH_RADIUS) * (180 / math.pi)
    delta_lon = (meters / EARTH_RADIUS) * (180 / math.pi) / math.cos(lat * math.pi / 180)

    if direction == "N":
        return lat + delta_lat, lon
    elif direction == "S":
        return lat - delta_lat, lon
    elif direction == "E":
        return lat, lon + delta_lon
    elif direction == "W":
        return lat, lon - delta_lon
    elif direction == "NE":
        return lat + delta_lat, lon + delta_lon
    elif direction == "NW":
        return lat + delta_lat, lon - delta_lon
    elif direction == "SE":
        return lat - delta_lat, lon + delta_lon
    elif direction == "SW":
        return lat - delta_lat, lon - delta_lon

def is_valid_street(lat, lon):
    """
    Checks if the given latitude/longitude corresponds to a valid street address.
    Uses Google Maps Reverse Geocoding API.
    """
    url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lon}&key={GOOGLE_MAPS_API_KEY}"
    response = requests.get(url).json()

    for result in response.get("results", []):
        if "route" in result["types"]:  # "route" type indicates a valid street
            return True
    return False

def get_uber_price_estimates(start_lat, start_lon, end_lat, end_lon):
    """
    Queries Uber API to get ride price estimates between the start and end locations.
    """
    session = Session(server_token=UBER_SERVER_TOKEN)
    client = UberRidesClient(session)

    response = client.get_price_estimates(
        start_latitude=start_lat,
        start_longitude=start_lon,
        end_latitude=end_lat,
        end_longitude=end_lon,
        seat_count=1
    )
    return response.json.get("prices", [])

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

                if best_price is None or price < best_price:
                    best_price = price
                    best_location = label
                    best_ride_type = ride_type

    return {"best_location": best_location, "best_price": best_price, "best_ride_type": best_ride_type}
