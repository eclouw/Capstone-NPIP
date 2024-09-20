import functions_framework
from flask import jsonify, request, make_response
from google.cloud import bigquery
import logging
from google.cloud.exceptions import NotFound, BadRequest
from typing import Optional, Any, Tuple, List, Dict

# Configure logging
logger = logging.getLogger('google_cloud_functions')
logger.setLevel(logging.INFO)

# Constants for BigQuery dataset and table names
BIGQUERY_DATASET = 'MeasurementLab'

# Constants for pagination and validation
DEFAULT_PAGE_SIZE = 100  # Default page size for paginated responses
MAX_PAGE_SIZE = 5000     # Maximum allowed page size to prevent excessive load

def validate_integer(param_name: str, param_value: Any) -> Optional[int]:
    """
    Validates if a query parameter is a valid integer.
    """
    try:
        return int(param_value)
    except (ValueError, TypeError):
        logger.warning(f"Invalid {param_name} format: {param_value}. Expected an integer.")
        return None

def validate_float(param_name: str, param_value: Any) -> Optional[float]:
    """
    Validates if a query parameter is a valid float.
    """
    try:
        return float(param_value)
    except (ValueError, TypeError):
        logger.warning(f"Invalid {param_name} format: {param_value}. Expected a float.")
        return None

def validate_latitude_longitude(latitude: Optional[float], longitude: Optional[float]) -> Tuple[bool, Optional[str]]:
    """
    Ensures that latitude and longitude values are within valid ranges.
    """
    if latitude is not None and (latitude < -90 or latitude > 90):
        return False, "Latitude must be between -90 and 90."
    if longitude is not None and (longitude < -180 or longitude > 180):
        return False, "Longitude must be between -180 and 180."
    return True, None

def error_response(message: str, status_code: int) -> Any:
    """
    Generates an error response with the specified status code and logs the error message.
    """
    logger.error(f"Status {status_code}: {message}")
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }
    return make_response(jsonify({'error': message}), status_code, headers)

def build_query(
    country: Optional[str] = None,
    year: Optional[int] = None,
    month: Optional[int] = None,
    region: Optional[str] = None,
    city: Optional[str] = None,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    as_number: Optional[int] = None,
    as_name: Optional[str] = None,
    group_by: Optional[List[str]] = None,
    page_size: int = DEFAULT_PAGE_SIZE,
    offset: int = 0
) -> Tuple[str, List[bigquery.ScalarQueryParameter]]:
    """
    Constructs a BigQuery SQL query that combines data from both upload and download tables,
    performing aggregation and grouping as specified.
    """
    # Define allowed group_by fields
    allowed_group_by_fields = {
        'year', 'month', 'country', 'region', 'city', 'latitude',
        'longitude', 'as_number', 'as_name'
    }

    # Validate group_by fields
    if not group_by:
        raise ValueError("The group_by parameter must be provided.")
    for field in group_by:
        if field not in allowed_group_by_fields:
            raise ValueError(f"Invalid group_by field: {field}")

    # Build SELECT clause for combined data
    select_fields = group_by.copy()

    # Build the rest of the query conditions and parameters
    query_conditions = []
    query_params = []

    # Add filters only if the corresponding values are provided
    if country:
        query_conditions.append("country = @country")
        query_params.append(bigquery.ScalarQueryParameter("country", "STRING", country))
    if year is not None:
        query_conditions.append("year = @year")
        query_params.append(bigquery.ScalarQueryParameter("year", "INT64", year))
    if month is not None:
        query_conditions.append("month = @month")
        query_params.append(bigquery.ScalarQueryParameter("month", "INT64", month))
    if region:
        query_conditions.append("region = @region")
        query_params.append(bigquery.ScalarQueryParameter("region", "STRING", region))
    if city:
        query_conditions.append("city = @city")
        query_params.append(bigquery.ScalarQueryParameter("city", "STRING", city))
    if latitude is not None:
        query_conditions.append("latitude = @latitude")
        query_params.append(bigquery.ScalarQueryParameter("latitude", "FLOAT64", latitude))
    if longitude is not None:
        query_conditions.append("longitude = @longitude")
        query_params.append(bigquery.ScalarQueryParameter("longitude", "FLOAT64", longitude))
    if as_number is not None:
        query_conditions.append("as_number = @as_number")
        query_params.append(bigquery.ScalarQueryParameter("as_number", "INT64", as_number))
    if as_name:
        query_conditions.append("as_name = @as_name")
        query_params.append(bigquery.ScalarQueryParameter("as_name", "STRING", as_name))

    # Build the WHERE clause
    where_clause = ""
    if query_conditions:
        where_clause = "WHERE " + " AND ".join(query_conditions)

    # Build the upload subquery
    upload_select_fields = ", ".join(select_fields)
    upload_aggregate_fields = """
        AVG(avg_upload_speed_mbps) AS avg_upload_speed_mbps,
        AVG(avg_latency_ms) AS avg_upload_latency_ms,
        SUM(num_tests) AS upload_num_tests
    """
    upload_subquery = f"""
    SELECT {upload_select_fields},
           {upload_aggregate_fields}
    FROM `{BIGQUERY_DATASET}.upload`
    {where_clause}
    GROUP BY {upload_select_fields}
    """

    # Build the download subquery
    download_select_fields = ", ".join(select_fields)
    download_aggregate_fields = """
        AVG(avg_download_speed_mbps) AS avg_download_speed_mbps,
        AVG(avg_packet_loss) AS avg_packet_loss,
        AVG(avg_latency_ms) AS avg_download_latency_ms,
        SUM(num_tests) AS download_num_tests
    """
    download_subquery = f"""
    SELECT {download_select_fields},
           {download_aggregate_fields}
    FROM `{BIGQUERY_DATASET}.download`
    {where_clause}
    GROUP BY {download_select_fields}
    """

    # Combine the two subqueries via FULL OUTER JOIN
    using_fields = ", ".join(select_fields)

    combined_query = f"""
    WITH
    upload_data AS (
        {upload_subquery}
    ),
    download_data AS (
        {download_subquery}
    )
    SELECT
        {', '.join(select_fields)},
        avg_upload_speed_mbps,
        avg_upload_latency_ms,
        upload_num_tests,
        avg_download_speed_mbps,
        avg_packet_loss,
        avg_download_latency_ms,
        download_num_tests,
        COUNT(*) OVER() AS total_rows
    FROM upload_data
    FULL OUTER JOIN download_data USING ({using_fields})
    """

    # Add ORDER BY clause
    order_by_clause = f"ORDER BY {', '.join(select_fields)}"

    # Add LIMIT and OFFSET for pagination
    pagination_clause = "LIMIT @page_size OFFSET @offset"

    # Combine all parts to form the final query
    final_query = f"""
    {combined_query}
    {order_by_clause}
    {pagination_clause}
    """

    # Add pagination parameters to the query
    query_params.append(bigquery.ScalarQueryParameter("page_size", "INT64", page_size))
    query_params.append(bigquery.ScalarQueryParameter("offset", "INT64", offset))

    return final_query, query_params

def execute_query(query: str, query_params: List[bigquery.ScalarQueryParameter]) -> List[Dict[str, Any]]:
    """
    Executes a BigQuery query and returns the results.
    """
    bq_client = bigquery.Client()
    job_config = bigquery.QueryJobConfig(query_parameters=query_params)
    query_job = bq_client.query(query, job_config=job_config)
    results = query_job.result()
    return [dict(row) for row in results]

@functions_framework.http
def compute_averages(request) -> Any:
    """
    Handles HTTP requests for computing averages of network measurement data.
    Performs input validation, constructs BigQuery queries, and returns paginated results.
    """
    
    # CORS headers to allow cross-origin requests
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "3600",
    }

    # Retrieve query parameters from the request
    args = request.args

    # Retrieve string parameters
    country = args.get('country')
    region = args.get('region')
    city = args.get('city')
    as_name = args.get('as_name')

    # Retrieve and validate numerical parameters
    year = args.get('year')
    month = args.get('month')
    latitude = args.get('latitude')
    longitude = args.get('longitude')
    as_number = args.get('as_number')
    page = args.get('page', '1')  # Default page is 1
    page_size = args.get('page_size', str(DEFAULT_PAGE_SIZE))  # Default page size

    # Get the group_by parameter
    group_by = args.get('group_by')
    if group_by:
        group_by = [field.strip() for field in group_by.split(',')]
    else:
        return error_response('The group_by parameter is required.', 400)

    # Validate and convert optional parameters
    year = validate_integer("year", year) if year else None
    if args.get('year') and year is None:
        return error_response('Invalid year format. Expected an integer.', 400)

    month = validate_integer("month", month) if month else None
    if args.get('month') and month is None:
        return error_response('Invalid month format. Expected an integer.', 400)

    latitude = validate_float("latitude", latitude) if latitude else None
    if args.get('latitude') and latitude is None:
        return error_response('Invalid latitude format. Expected a float.', 400)

    longitude = validate_float("longitude", longitude) if longitude else None
    if args.get('longitude') and longitude is None:
        return error_response('Invalid longitude format. Expected a float.', 400)

    as_number = validate_integer("as_number", as_number) if as_number else None
    if args.get('as_number') and as_number is None:
        return error_response('Invalid AS number format. Expected an integer.', 400)

    # Enhanced year and month validation
    if year is not None and (year < 2019 or year > 2100):
        return error_response('Invalid year provided. Year must be between 2019 and 2100.', 400)

    if month is not None and (month < 1 or month > 12):
        return error_response('Invalid month provided. Month must be between 1 and 12.', 400)

    # Validate latitude/longitude ranges
    valid_lat_lon, lat_lon_error_message = validate_latitude_longitude(latitude, longitude)
    if not valid_lat_lon:
        return error_response(lat_lon_error_message, 400)

    # Validate pagination parameters
    try:
        page = int(page)
        page_size = min(int(page_size), MAX_PAGE_SIZE)
        if page < 1 or page_size < 1:
            raise ValueError
    except ValueError:
        return error_response('Invalid pagination parameters.', 400)

    offset = (page - 1) * page_size  # Calculate offset for pagination

    # Execute BigQuery query and return the results
    try:
        # Build and run the query
        query, query_params = build_query(
            country=country,
            year=year,
            month=month,
            region=region,
            city=city,
            latitude=latitude,
            longitude=longitude,
            as_number=as_number,
            as_name=as_name,
            group_by=group_by,
            page_size=page_size,
            offset=offset
        )

        logger.info(f"Running BigQuery query with group_by={group_by} and filters.")

        data = execute_query(query, query_params)

        # Handle case where no data is returned
        if not data:
            logger.info("No data found with the applied filters.")
            return make_response(jsonify({'error': 'No data found for the given parameters.'}), 200, headers)

        # Extract total_rows from the first row
        total_rows = data[0].get('total_rows', 0)
        for row in data:
            row.pop('total_rows', None)  # Remove total_rows from individual records

        # Calculate if there are more pages
        total_pages = (total_rows + page_size - 1) // page_size
        has_more = page < total_pages

        # Successful response with paginated data
        logger.info("Query successful.")
        return make_response(jsonify({
            'data': data,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total_pages': total_pages,
                'total_rows': total_rows,
                'has_more': has_more
            }
        }), 200, headers)

    # Handle specific BigQuery exceptions
    except ValueError as e:
        return error_response(str(e), 400)

    except NotFound as e:
        return error_response("BigQuery dataset or table not found.", 404)

    except BadRequest as e:
        logger.error(f"BadRequest: {e.message}")
        return error_response("Bad request to BigQuery.", 400)

    # Handle any other unexpected errors
    except Exception as e:
        logger.exception("An unexpected error occurred.")
        return error_response("An unexpected error occurred.", 500)
