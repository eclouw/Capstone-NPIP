import functions_framework
from flask import jsonify, request, make_response
from google.cloud import bigquery
import logging
from google.cloud.exceptions import NotFound, BadRequest
from typing import Optional, Any, Tuple, List, Dict
import html

# Configure logging
logger = logging.getLogger('google_cloud_functions')

# Constants for BigQuery dataset and table names
BIGQUERY_DATASET = 'RipeAtlas'
BIGQUERY_TABLE = 'probes'

def validate_integer(param_name: str, param_value: Any) -> Optional[int]:
    """
    Validates if a query parameter is a valid integer.
    Logs a warning if invalid and returns None.
    """
    try:
        return int(param_value)
    except (ValueError, TypeError):
        logger.warning(f"Invalid {param_name} format: {param_value}. Expected an integer.")
        return None

def validate_float(param_name: str, param_value: Any) -> Optional[float]:
    """
    Validates if a query parameter is a valid float.
    Logs a warning if invalid and returns None.
    """
    try:
        return float(param_value)
    except (ValueError, TypeError):
        logger.warning(f"Invalid {param_name} format: {param_value}. Expected a float.")
        return None

def validate_latitude_longitude(latitude: Optional[float], longitude: Optional[float]) -> Tuple[bool, Optional[str]]:
    """
    Ensures latitude is between -90 and 90, and longitude between -180 and 180.
    Returns a tuple: (is_valid, error_message) where is_valid is True if both are valid.
    """
    if latitude is not None and (latitude < -90 or latitude > 90):
        return False, "Latitude must be between -90 and 90."
    if longitude is not None and (longitude < -180 or longitude > 180):
        return False, "Longitude must be between -180 and 180."
    return True, None

def error_response(message: str, status_code: int) -> Any:
    """
    Generates an error response with the specified status code and logs the error.
    """
    logger.error(f"Status {status_code}: {message}")
    return make_response(jsonify({'error': message}), status_code, headers)

def build_query(
    country_code: Optional[str] = None,
    is_anchor: Optional[bool] = None,
    supports_v4: Optional[bool] = None,
    supports_v6: Optional[bool] = None,
    status_id: Optional[int] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None
) -> Tuple[str, List[bigquery.ScalarQueryParameter]]:
    """
    Constructs a BigQuery SQL query for the probes table based on the provided filters.
    Filters are added conditionally if the corresponding parameter is not None.
    """
    query_conditions = []
    query_params = []

    # Add filters conditionally based on provided parameters
    if country_code:
        query_conditions.append("country_code = @country_code")
        query_params.append(bigquery.ScalarQueryParameter("country_code", "STRING", country_code))
    
    if is_anchor is not None:
        query_conditions.append("is_anchor = @is_anchor")
        query_params.append(bigquery.ScalarQueryParameter("is_anchor", "BOOL", is_anchor))
    
    if supports_v4 is not None:
        query_conditions.append("supports_v4 = @supports_v4")
        query_params.append(bigquery.ScalarQueryParameter("supports_v4", "BOOL", supports_v4))
    
    if supports_v6 is not None:
        query_conditions.append("supports_v6 = @supports_v6")
        query_params.append(bigquery.ScalarQueryParameter("supports_v6", "BOOL", supports_v6))
    
    if status_id is not None:
        query_conditions.append("status_id = @status_id")
        query_params.append(bigquery.ScalarQueryParameter("status_id", "INT64", status_id))
    
    if lat is not None:
        query_conditions.append("lat = @lat")
        query_params.append(bigquery.ScalarQueryParameter("lat", "FLOAT64", lat))
    
    if lng is not None:
        query_conditions.append("lng = @lng")
        query_params.append(bigquery.ScalarQueryParameter("lng", "FLOAT64", lng))

    # Ensure at least one condition is added to avoid scanning the entire table
    if not query_conditions:
        raise ValueError("At least one filter parameter must be provided.")

    # Construct the final SQL query string
    query = f"""
    SELECT
        id, country_code, is_anchor, supports_v4, supports_v6, status_id, status_since, 
        system_type, lat, lng
    FROM `{BIGQUERY_DATASET}.{BIGQUERY_TABLE}`
    WHERE {" AND ".join(query_conditions)}
    """

    return query, query_params

def execute_query(query: str, query_params: List[bigquery.ScalarQueryParameter]) -> List[Dict[str, Any]]:
    """
    Executes the constructed BigQuery query and returns the results as a list of dictionaries.
    """
    bq_client = bigquery.Client()
    job_config = bigquery.QueryJobConfig(query_parameters=query_params)
    query_job = bq_client.query(query, job_config=job_config)
    results = query_job.result()
    return [dict(row) for row in results]

@functions_framework.http
def get_probe_data(request) -> Any:
    """
    Handles HTTP requests for fetching probe data.
    Validates input, constructs the query, executes it, and returns the results.
    """

    # CORS headers to handle cross-origin requests
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "3600",
    }

    # Get query parameters from the request
    args = request.args

    # Sanitize and retrieve the country_code parameter
    country_code = html.escape(args.get('country_code')) if args.get('country_code') else None

    # Retrieve boolean parameters and convert them to True/False or None
    is_anchor = args.get('is_anchor')
    supports_v4 = args.get('supports_v4')
    supports_v6 = args.get('supports_v6')

    is_anchor = is_anchor.lower() == 'true' if is_anchor else None
    supports_v4 = supports_v4.lower() == 'true' if supports_v4 else None
    supports_v6 = supports_v6.lower() == 'true' if supports_v6 else None

    # Validate and retrieve numerical parameters
    status_id = validate_integer("status_id", args.get('status_id'))
    lat = validate_float("lat", args.get('lat'))
    lng = validate_float("lng", args.get('lng'))

    # Execute the BigQuery query
    try:
        # If no filter is provided, return the entire list of probes
        if not (country_code or is_anchor is not None or supports_v4 is not None or supports_v6 is not None or status_id or lat or lng):
            query = f"""
            SELECT
                id, country_code, is_anchor, supports_v4, supports_v6, status_id, status_since, 
                system_type, lat, lng
            FROM `{BIGQUERY_DATASET}.{BIGQUERY_TABLE}`
            """
            query_params = []

        else:
            # Build the query with filters if they are provided
            query, query_params = build_query(
                country_code=country_code,
                is_anchor=is_anchor,
                supports_v4=supports_v4,
                supports_v6=supports_v6,
                status_id=status_id,
                lat=lat,
                lng=lng
            )

        logger.info(f"Running BigQuery query with filters: country_code={country_code}, is_anchor={is_anchor}")

        data = execute_query(query, query_params)

        # If no data is returned, notify
        if not data:
            return make_response(jsonify({'error': 'No data found for the given parameters.'}), 200, headers)

        return make_response(jsonify({'data': data}), 200, headers)

    except Exception as e:
        logger.exception("An unexpected error occurred.")
        return error_response("An unexpected error occurred.", 500)
