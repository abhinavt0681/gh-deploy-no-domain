from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.analytics_service import (
    get_analytics_data, 
    get_locations_by_property_type,
    get_data_from_sql,
    get_locations_by_property_type_sql,
    METRIC_INFO
)
from app.schemas.analytics import AnalyticsResponse, AvailableLocationsResponse, TimeSeriesData, TimeSeriesDataPoint

router = APIRouter()

@router.get("/data", response_model=AnalyticsResponse)
def read_analytics_data(
    housing_type: str = Query(..., description="Property type: condos, multifamily, singlefamily"),
    location: str = Query(..., description="Location (town or town/neighborhood)"),
    start_year: int = Query(..., ge=1995, le=2025, description="Starting year (1995-2025)"),
    end_year: int = Query(..., ge=1995, le=2025, description="Ending year (must be > start_year)"),
    metric: str = Query(..., description="Metric to analyze"),
    compare_locations: Optional[str] = Query(None, description="Optional comma-separated list of locations to compare"),
    db: Session = Depends(get_db)
):
    """
    Get analytics data for a specific location, property type, and metric.
    Optionally, compare with multiple other locations.
    """
    if start_year >= end_year:
        raise HTTPException(status_code=400, detail="start_year must be less than end_year")
        
    if metric not in METRIC_INFO:
        raise HTTPException(status_code=400, detail=f"Invalid metric: {metric}. Available metrics: {list(METRIC_INFO.keys())}")
    
    try:
        # Try ORM approach first
        return get_analytics_data(
            db=db,
            housing_type=housing_type.lower(),
            location=location.lower(),
            start_year=start_year,
            end_year=end_year,
            metric=metric,
            compare_locations=compare_locations.split(',') if compare_locations else None
        )
    except Exception as e:
        # If ORM approach fails, try direct SQL approach
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"ORM approach failed: {str(e)}. Trying direct SQL approach.")
        
        try:
            # Get metric information
            metric_column = METRIC_INFO[metric]["column"]
            metric_unit = METRIC_INFO[metric]["unit"]
            
            # Get primary location data using SQL
            primary_data = get_data_from_sql(
                location.lower(), 
                housing_type.lower(), 
                start_year, 
                end_year, 
                metric_column
            )
            
            # Prepare response
            response = AnalyticsResponse(
                primary=TimeSeriesData(
                    location=location,
                    metric=metric,
                    unit=metric_unit,
                    data=primary_data
                ),
                metadata={"housing_type": housing_type}
            )
            
            # Get comparison data if requested
            if compare_locations:
                compare_locs = [loc.strip() for loc in compare_locations.split(',')]
                comparisons = []
                
                for compare_loc in compare_locs:
                    try:
                        compare_data = get_data_from_sql(
                            compare_loc.lower(), 
                            housing_type.lower(), 
                            start_year, 
                            end_year, 
                            metric_column
                        )
                        
                        comparisons.append(TimeSeriesData(
                            location=compare_loc,
                            metric=metric,
                            unit=metric_unit,
                            data=compare_data
                        ))
                    except Exception as e:
                        logger.warning(f"Failed to get comparison data for {compare_loc}: {str(e)}")
                
                response.comparisons = comparisons
            
            return response
        except ValueError as e:
            # For expected errors like no data found
            raise HTTPException(status_code=404, detail=str(e))
        except Exception as e:
            # For unexpected errors
            import traceback
            error_details = traceback.format_exc()
            # Log the full error
            logger.error(f"Database error (both approaches failed): {str(e)}\n{error_details}")
            # Return appropriate error
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/locations", response_model=AvailableLocationsResponse)
def read_available_locations(
    housing_type: str = Query(..., description="Property type: condos, multifamily, singlefamily"),
    db: Session = Depends(get_db)
):
    """
    Get all available locations for a specific property type.
    """
    try:
        # Try ORM approach first
        locations = get_locations_by_property_type(db, housing_type.lower())
        return AvailableLocationsResponse(locations=locations)
    except Exception as e:
        # If ORM approach fails, try direct SQL approach
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"ORM locations approach failed: {str(e)}. Trying direct SQL approach.")
        
        try:
            # Get locations using SQL
            locations = get_locations_by_property_type_sql(housing_type.lower())
            return AvailableLocationsResponse(locations=locations)
        except ValueError as e:
            # For expected errors like no locations found
            raise HTTPException(status_code=404, detail=str(e))
        except Exception as e:
            # For unexpected database errors
            import traceback
            error_details = traceback.format_exc()
            # Log the full error
            logger.error(f"Database error for locations (both approaches failed): {str(e)}\n{error_details}")
            # Return appropriate error
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/metrics")
def read_available_metrics():
    """
    Get all available metrics with their descriptions and units.
    """
    return {
        metric: {
            "description": metric.replace("_", " ").title(),
            "unit": info["unit"]
        }
        for metric, info in METRIC_INFO.items()
    } 