""" Main API router """
from fastapi import APIRouter
from app.auth import router as auth_router

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

# Include other sub-routers
router.include_router(auth_router, prefix="/auth", tags=["Auth"])
