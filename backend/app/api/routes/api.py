from fastapi import APIRouter

from app.api.endpoints import analytics

router = APIRouter()

# Include all endpoint routers
router.include_router(analytics.router, prefix="/analytics", tags=["analytics"]) 