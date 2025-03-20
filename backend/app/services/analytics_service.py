from typing import Dict, List, Optional, Tuple
from sqlalchemy.orm import Session
import pandas as pd
import random
import logging

from app.models.location import LocationDimension
from app.models.fact import Fact
from app.schemas.analytics import TimeSeriesData, TimeSeriesDataPoint, AnalyticsResponse
from app.db.session import get_engine

# Set up logging
logger = logging.getLogger(__name__)

# Mapping from housing type to property type code
PROPERTY_TYPE_MAPPING = {
    "condos": "cc",
    "multifamily": "mf",
    "singlefamily": "sf"
}

# Metric mapping with unit information
METRIC_INFO = {
    "total_listings": {"column": "total_listings", "unit": "listings"},
    "avg_days_on_market": {"column": "avg_days_on_market", "unit": "days"},
    "avg_days_to_offer": {"column": "avg_days_to_offer", "unit": "days"},
    "average_sale_price": {"column": "average_sale_price", "unit": "dollars"},
    "average_list_price": {"column": "average_list_price", "unit": "dollars"},
    "sp_lp_ratio": {"column": "sp_lp_ratio", "unit": "ratio"},
    "average_orig_price": {"column": "average_orig_price", "unit": "dollars"},
    "sp_op_ratio": {"column": "sp_op_ratio", "unit": "ratio"},
    "lowest_price": {"column": "lowest_price", "unit": "dollars"},
    "highest_price": {"column": "highest_price", "unit": "dollars"},
    "median_price": {"column": "median_price", "unit": "dollars"},
    "total_market_volume": {"column": "total_market_volume", "unit": "dollars"}
}

def get_location_filter(location: str) -> Tuple[str, Optional[str]]:
    """Parse a location string into town and neighborhood components"""
    if "/" in location:
        town, neighborhood = location.lower().split("/", 1)
        return town.strip(), neighborhood.strip()
    return location.lower().strip(), None

def get_locations_by_property_type(db: Session, property_type: str) -> List[str]:
    """Get all available locations for a given property type"""
    prop_code = PROPERTY_TYPE_MAPPING.get(property_type.lower(), property_type.lower())
    
    locations = (
        db.query(LocationDimension)
        .filter(LocationDimension.property_type == prop_code)
        .all()
    )
    
    if not locations:
        error_msg = f"No locations found for property type: {property_type}"
        logger.error(error_msg)
        raise ValueError(error_msg)
    
    result = []
    for loc in locations:
        if loc.neighborhood and loc.neighborhood.strip():
            result.append(f"{loc.town}/{loc.neighborhood}")
        else:
            result.append(loc.town)
    
    return sorted(result)

def get_analytics_data(
    db: Session,
    housing_type: str,
    location: str,
    start_year: int,
    end_year: int,
    metric: str,
    compare_locations: Optional[List[str]] = None
) -> AnalyticsResponse:
    """Get analytics data for one or more locations"""
    # Validate years
    if start_year >= end_year:
        raise ValueError("Start year must be less than end year")
    
    # Get metric information
    if metric not in METRIC_INFO:
        raise ValueError(f"Invalid metric: {metric}")
    
    metric_column = METRIC_INFO[metric]["column"]
    metric_unit = METRIC_INFO[metric]["unit"]
    
    # Get property type code
    prop_code = PROPERTY_TYPE_MAPPING.get(housing_type.lower(), housing_type.lower())
    
    # Log the request for debugging
    logger.info(f"Analytics request: housing_type={housing_type}, location={location}, metric={metric}, years={start_year}-{end_year}, compare_locations={compare_locations}")
    
    # Get primary location data
    primary_town, primary_neighborhood = get_location_filter(location)
    primary_data = get_location_timeseries(
        db, prop_code, primary_town, primary_neighborhood, 
        start_year, end_year, metric_column
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
    if compare_locations and len(compare_locations) > 0:
        comparisons = []
        for compare_loc in compare_locations:
            compare_town, compare_neighborhood = get_location_filter(compare_loc)
            try:
                compare_data = get_location_timeseries(
                    db, prop_code, compare_town, compare_neighborhood, 
                    start_year, end_year, metric_column
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

def get_location_timeseries(
    db: Session,
    property_type: str,
    town: str,
    neighborhood: Optional[str],
    start_year: int,
    end_year: int,
    metric_column: str
) -> List[TimeSeriesDataPoint]:
    """Get time series data for a specific location and metric"""
    # Log the query parameters for debugging
    logger.info(f"Querying data for: town={town}, neighborhood={neighborhood}, property_type={property_type}, years={start_year}-{end_year}, metric={metric_column}")
    
    query = (
        db.query(Fact.year, getattr(Fact, metric_column))
        .join(LocationDimension, LocationDimension.location_id == Fact.location_id)
        .filter(LocationDimension.property_type == property_type)
        .filter(LocationDimension.town == town)
        .filter(Fact.year >= start_year)
        .filter(Fact.year <= end_year)
    )
    
    if neighborhood:
        query = query.filter(LocationDimension.neighborhood == neighborhood)
    else:
        # If no neighborhood specified, get town-level data
        query = query.filter((LocationDimension.neighborhood == None) | 
                            (LocationDimension.neighborhood == ""))
    
    # Log the SQL query for debugging
    sql_query = str(query.statement.compile(compile_kwargs={"literal_binds": True}))
    logger.info(f"SQL Query: {sql_query}")
    
    # Order by year
    query = query.order_by(Fact.year)
    
    # Execute query and convert to data points
    results = query.all()
    
    # Log the results count
    logger.info(f"Query returned {len(results)} results")
    
    data_points = [
        TimeSeriesDataPoint(year=year, value=value)
        for year, value in results
        if value is not None  # Skip null values
    ]
    
    # If no data found, raise an error - no fallback to dummy data
    if not data_points:
        error_msg = f"No data found in database for {town} ({property_type}) from {start_year} to {end_year}."
        logger.error(error_msg)
        raise ValueError(error_msg)
    
    return data_points

def generate_dummy_timeseries(start_year: int, end_year: int, metric_column: str) -> List[TimeSeriesDataPoint]:
    """Generate dummy time series data for testing"""
    # Determine appropriate value ranges based on metric
    if metric_column in ["avg_days_on_market", "avg_days_to_offer"]:
        # Days metrics (typically 1-90 days)
        base_value = random.randint(20, 40)
        variation = 10
    elif metric_column in ["sp_lp_ratio", "sp_op_ratio"]:
        # Ratio metrics (typically 0.9-1.1)
        base_value = 0.95 + (random.random() * 0.1)
        variation = 0.05
    elif "price" in metric_column:
        # Price metrics (hundreds of thousands)
        base_value = random.randint(300000, 600000)
        variation = 50000
    elif metric_column == "total_listings":
        # Listing count metrics
        base_value = random.randint(50, 200)
        variation = 30
    elif metric_column == "total_market_volume":
        # Market volume metrics (millions)
        base_value = random.randint(5000000, 20000000)
        variation = 2000000
    else:
        # Default
        base_value = 100
        variation = 20
    
    # Generate data points with a slight trend
    trend_factor = random.choice([-1, 1]) * (random.random() * 0.1)  # -0.1 to 0.1
    
    data_points = []
    for year in range(start_year, end_year + 1):
        # Calculate value with small random variation and trend
        year_progress = (year - start_year) / max(1, end_year - start_year)
        trend_adjustment = 1.0 + (trend_factor * year_progress)
        
        # Add random noise
        noise = (random.random() * 2 - 1) * variation
        
        value = base_value * trend_adjustment + noise
        
        # Ensure positive values for metrics that can't be negative
        if "price" in metric_column or "total" in metric_column or "days" in metric_column:
            value = max(1, value)
        
        data_points.append(TimeSeriesDataPoint(year=year, value=value))
    
    return data_points

def create_dummy_response(
    housing_type: str, 
    location: str,
    metric: str,
    start_year: int,
    end_year: int,
    compare: Optional[str] = None
) -> AnalyticsResponse:
    """Create a dummy response with generated data"""
    metric_column = METRIC_INFO[metric]["column"]
    metric_unit = METRIC_INFO[metric]["unit"]
    
    primary_data = generate_dummy_timeseries(start_year, end_year, metric_column)
    
    response = AnalyticsResponse(
        primary=TimeSeriesData(
            location=location,
            metric=metric,
            unit=metric_unit,
            data=primary_data
        ),
        metadata={"housing_type": housing_type, "is_dummy_data": True}
    )
    
    if compare:
        compare_data = generate_dummy_timeseries(start_year, end_year, metric_column)
        response.comparison = TimeSeriesData(
            location=compare,
            metric=metric,
            unit=metric_unit,
            data=compare_data
        )
    
    return response

def get_data_from_sql(location_param: str, housing_type: str, start_year: int, end_year: int, metric_column: str) -> List[TimeSeriesDataPoint]:
    """
    Get time series data using direct SQL query, similar to the original implementation.
    This is an alternative approach that uses raw SQL instead of the ORM.
    """
    prop_code = PROPERTY_TYPE_MAPPING.get(housing_type.lower(), housing_type.lower())
    location_param = location_param.strip().lower()
    
    if "/" in location_param:
        # Format: "town/neighborhood"
        town, neighborhood = map(str.strip, location_param.split("/", 1))
        filter_condition = f"lower(d.town) = '{town}' AND lower(d.neighborhood) = '{neighborhood}'"
    else:
        # Town-only: return only the town-level data (neighborhood empty or NULL)
        filter_condition = f"lower(d.town) = '{location_param}' AND (d.neighborhood IS NULL OR lower(d.neighborhood) = '')"
    
    # Construct SQL query similar to the original implementation
    # Use the actual table names from the RDS database
    query = f"""
    SELECT f.year, f.{metric_column}
    FROM fact_table f
    JOIN location_dimension d ON f.location_id = d.location_id
    WHERE {filter_condition}
      AND lower(d.property_type) = '{prop_code}'
      AND f.year BETWEEN {start_year} AND {end_year}
    ORDER BY f.year;
    """
    
    logger.info(f"Executing SQL query directly: {query}")
    
    # Use the engine to execute the query
    engine = get_engine()
    try:
        df = pd.read_sql_query(query, engine)
        
        # Log the results count
        logger.info(f"SQL query returned {len(df)} results")
        
        if df.empty:
            error_msg = f"No data found in database for {location_param} ({prop_code}) from {start_year} to {end_year}."
            logger.error(error_msg)
            raise ValueError(error_msg)
        
        # Convert to data points
        data_points = [
            TimeSeriesDataPoint(year=row["year"], value=row[metric_column])
            for _, row in df.iterrows()
            if row[metric_column] is not None  # Skip null values
        ]
        
        return data_points
    except Exception as e:
        logger.error(f"Error executing SQL query: {str(e)}")
        raise ValueError(f"Database query error: {str(e)}")

def get_locations_by_property_type_sql(property_type: str) -> List[str]:
    """Get all available locations for a given property type using direct SQL"""
    prop_code = PROPERTY_TYPE_MAPPING.get(property_type.lower(), property_type.lower())
    
    # Construct SQL query
    query = f"""
    SELECT DISTINCT
        CASE 
            WHEN neighborhood IS NULL OR TRIM(neighborhood) = '' THEN town
            ELSE town || '/' || neighborhood
        END AS combined_location
    FROM location_dimension
    WHERE lower(property_type) = '{prop_code}'
    ORDER BY combined_location;
    """
    
    logger.info(f"Executing SQL locations query directly: {query}")
    
    # Use the engine to execute the query
    engine = get_engine()
    try:
        df = pd.read_sql_query(query, engine)
        
        # Log the results count
        logger.info(f"SQL locations query returned {len(df)} results")
        
        if df.empty:
            error_msg = f"No locations found in database for property type: {property_type}"
            logger.error(error_msg)
            raise ValueError(error_msg)
        
        return df["combined_location"].tolist()
    except Exception as e:
        logger.error(f"Error executing SQL locations query: {str(e)}")
        raise ValueError(f"Database query error: {str(e)}") 