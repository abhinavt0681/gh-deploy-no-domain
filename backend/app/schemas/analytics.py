from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field

class AnalyticsParams(BaseModel):
    """Query parameters for analytics API endpoints"""
    housing_type: str = Field(..., description="Property type: condos, multifamily, singlefamily")
    location: str = Field(..., description="Location as town or town/neighborhood")
    start_year: int = Field(..., ge=1995, le=2025, description="Starting year (1995-2025)")
    end_year: int = Field(..., ge=1995, le=2025, description="Ending year (must be > start_year)")
    metric: str = Field(..., description="Metric to visualize")
    compare: Optional[str] = Field(None, description="Optional second location to compare")

class TimeSeriesDataPoint(BaseModel):
    """Single data point in a time series"""
    year: int
    value: Union[float, int]

class TimeSeriesData(BaseModel):
    """Time series data for a location"""
    location: str
    metric: str
    unit: Optional[str] = None
    data: List[TimeSeriesDataPoint]

class AnalyticsResponse(BaseModel):
    """Response object for analytics API endpoints"""
    primary: TimeSeriesData
    comparisons: List[TimeSeriesData] = []
    metadata: Dict[str, Any] = {}

class AvailableLocationsResponse(BaseModel):
    """Response object for available locations endpoint"""
    locations: List[str] 