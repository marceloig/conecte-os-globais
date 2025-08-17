from fastapi import APIRouter
from app.api.v1 import endpoints

api_router = APIRouter()
api_router.include_router(endpoints.router_health, tags=["health"])
api_router.include_router(endpoints.router)