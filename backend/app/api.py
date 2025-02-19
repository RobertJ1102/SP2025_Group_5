""" Main API router """
import random
from math import radians, sin, cos, sqrt, atan2
from fastapi import APIRouter, HTTPException
from app.auth import router as auth_router
from app.profile import router as profile_router
from app.uber import router as uber_router
from .models import PriceEstimate, PriceEstimatesResponse

router = APIRouter()

# General routes
@router.get("/", tags=["root"])
async def read_root():
    """ Root API """
    return {"message": "Hello World, this is the Root API of the FastAPI app"}

@router.get("/test")
async def get_test():
    """ Test API """
    return {"message": "Hello World, this is a test API"}


def haversine_distance(lat1, lon1, lat2, lon2):
    """ Calculate the great circle distance between two points on the Earth """
    # Earth radius in kilometers
    r = 6371.0

    # Convert latitude and longitude from degrees to radians
    lat1_rad = radians(lat1)
    lon1_rad = radians(lon1)
    lat2_rad = radians(lat2)
    lon2_rad = radians(lat2)
    lon2_rad = radians(lon2)

    # Compute differences
    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad

    # Haversine formula
    a = sin(dlat / 2)**2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    # Distance in kilometers
    distance = r * c
    return distance

@router.get("/estimates/price", response_model=PriceEstimatesResponse)
def get_price_estimates(start_latitude: float, start_longitude: float,
    end_latitude: float, end_longitude: float, seat_count: int = 1):
    """ Get price estimates for different Uber products """

    if seat_count > 2:
        raise HTTPException(status_code=400,
                            detail="seat_count cannot be greater than 2 for uberPOOL.")

    # Calculate distance between start and end points
    distance_km = haversine_distance(start_latitude, start_longitude, end_latitude, end_longitude)

    # Define base fare and per km rates for each product
    products = [
        {"display_name": "UberX", "base_fare": 2.0, "per_km": 1.0, "product_id": "uberx123"},
        {"display_name": "UberXL", "base_fare": 3.0, "per_km": 1.5, "product_id": "uberxl123"},
        {"display_name": "Uber Black", "base_fare": 5.0, "per_km": 2.5,
                                         "product_id": "uberblack123"},
    ]

    estimates = []
    for product in products:
        # Randomize fare within a range
        dist = product["per_km"] * distance_km
        low_estimate = product["base_fare"] + dist + random.uniform(-1, 1)
        high_estimate = low_estimate * random.uniform(1.1, 1.5)
        estimate_str = f"${low_estimate:.2f} - ${high_estimate:.2f}"

        estimates.append(PriceEstimate(
            localized_display_name=product["display_name"],
            distance=distance_km,
            display_name=product["display_name"],
            product_id=product["product_id"],
            high_estimate=round(high_estimate, 2),
            low_estimate=round(low_estimate, 2),
            duration=int(distance_km / 40 * 3600),  # Assuming average speed of 40 km/h
            estimate=estimate_str,
            currency_code="USD"
        ))

    return PriceEstimatesResponse(prices=estimates)



# Include other sub-routers
router.include_router(auth_router, prefix="/auth", tags=["Auth"])
router.include_router(profile_router, prefix="/profile", tags=["Profile"])
router.include_router(uber_router, prefix="/uber", tags=["Uber"])
