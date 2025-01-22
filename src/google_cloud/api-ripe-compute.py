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
BIGQUERY_DATASET = 'RipeAtlas'

# Constants for pagination and validation
DEFAULT_PAGE_SIZE = 100
MAX_PAGE_SIZE = 5000

# Function to validate integer parameters from the request
def validate_integer(param_name: str, param_value: Any) -> Optional[int]:
    try:
        return int(param_value)  # Try to cast the parameter to an integer
    except (ValueError, TypeError):
        logger.warning(f"Invalid {param_name} format: {param_value}. Expected an integer.")
        return None

# Function to validate latitude and longitude values
def validate_latitude_longitude(latitude: Optional[float], longitude: Optional[float]) -> Tuple[bool, Optional[str]]: 
    # Check if latitude is within valid range
    if latitude is not None and not (-90 <= latitude <= 90):
        return False, "Latitude must be between -90 and 90."
    # Check if longitude is within valid range
    if longitude is not None and not (-180 <= longitude <= 180):
        return False, "Longitude must be between -180 and 180."
    return True, None  # Return true if both are valid

# Function to create a standard error response
def error_response(message: str, status_code: int) -> Any:
    logger.error(f"Status {status_code}: {message}")
    return make_response(jsonify({'error': message}), status_code)

# Function to build a BigQuery SQL query based on the input parameters
def build_query(
    year: Optional[int] = None,
    month: Optional[int] = None,
    probe_id: Optional[int] = None,
    measurement_id: Optional[int] = None,
    page_size: int = DEFAULT_PAGE_SIZE,
    offset: int = 0,
    group_by: Optional[List[str]] = None,
    count_only: bool = False
) -> Tuple[str, List[bigquery.ScalarQueryParameter]]:
    # Set of allowed fields for grouping the query results
    allowed_group_by_fields = {'year', 'month', 'probe_id', 'measurement_id'}
    
    # Validate the group_by fields
    if not group_by or any(field not in allowed_group_by_fields for field in group_by):
        raise ValueError("Invalid group_by parameter.")  # Raise error if any field is invalid
    
    # Build the SELECT clause, depending on whether we are counting rows or selecting data
    if count_only:
        select_clause = "COUNT(*) AS total_rows"  # Only count rows if count_only is True
    else:
        select_fields = ", ".join(group_by)  # Select the fields specified in group_by
        aggregate_fields = """
            AVG(avg_rtt) AS avg_rtt,
            MIN(min_rtt) AS min_rtt,
            MAX(max_rtt) AS max_rtt,
            SUM(num_measurements) AS total_measurements
        """
        select_clause = f"{select_fields}, {aggregate_fields}"

    # List to hold query conditions and parameters
    query_conditions, query_params = [], []
    
    # Add conditions to filter data based on year, month, probe_id, and measurement_id
    if year is not None:
        query_conditions.append("year = @year")
        query_params.append(bigquery.ScalarQueryParameter("year", "INT64", year))
    if month is not None:
        query_conditions.append("month = @month")
        query_params.append(bigquery.ScalarQueryParameter("month", "INT64", month))
    if probe_id is not None:
        query_conditions.append("probe_id = @probe_id")
        query_params.append(bigquery.ScalarQueryParameter("probe_id", "INT64", probe_id))
    if measurement_id is not None:
        query_conditions.append("measurement_id = @measurement_id")
        query_params.append(bigquery.ScalarQueryParameter("measurement_id", "INT64", measurement_id))
    
    # Build the WHERE clause based on the conditions
    where_clause = f"WHERE {' AND '.join(query_conditions)}" if query_conditions else ""
    
    # Build the final query
    if count_only:
        final_query = f"""
            SELECT {select_clause}
            FROM `{BIGQUERY_DATASET}.measurements`
            {where_clause}
        """  # Only count rows if count_only is True
    else:
        final_query = f"""
            SELECT {select_clause}
            FROM `{BIGQUERY_DATASET}.measurements`
            {where_clause}
            GROUP BY {select_fields}
            ORDER BY {select_fields}
            LIMIT @page_size OFFSET @offset
        """  # Full query with data selection, pagination, and ordering
        query_params.append(bigquery.ScalarQueryParameter("page_size", "INT64", page_size))
        query_params.append(bigquery.ScalarQueryParameter("offset", "INT64", offset))
    
    return final_query, query_params  # Return the query string and its parameters

# Function to execute a query on BigQuery and return the results
def execute_query(query: str, query_params: List[bigquery.ScalarQueryParameter]) -> List[Dict[str, Any]]:
    bq_client = bigquery.Client()  # Create a BigQuery client
    job_config = bigquery.QueryJobConfig(query_parameters=query_params)
    results = bq_client.query(query, job_config=job_config).result()
    return [dict(row) for row in results]  # Convert each row into a dictionary and return as a list

# Main Cloud Function to handle HTTP requests
@functions_framework.http
def compute_averages(request) -> Any:
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "3600",
    }

    args = request.args  # Get request parameters
    year = validate_integer("year", args.get('year'))
    month = validate_integer("month", args.get('month'))
    probe_id = validate_integer("probe_id", args.get('probe_id'))
    measurement_id = validate_integer("measurement_id", args.get('measurement_id'))
    page = validate_integer("page", args.get('page', '1')) or 1  # Default to page 1 if not provided
    page_size = min(validate_integer("page_size", args.get('page_size', str(DEFAULT_PAGE_SIZE))) or DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE)
    
    # Validate the page number
    if page < 1:
        return error_response("Invalid page number. Must be 1 or greater.", 400)
    
    # Get and validate the group_by parameter
    group_by = args.get('group_by')
    if not group_by:
        return error_response('The group_by parameter is required.', 400)
    group_by = [field.strip() for field in group_by.split(',')]

    # Validate the year and month
    if year and (year < 2019 or year > 2100):
        return error_response('Invalid year. Must be between 2019 and 2100.', 400)
    if month and (month < 1 or month > 12):
        return error_response('Invalid month. Must be between 1 and 12.', 400)

    offset = (page - 1) * page_size  # Calculate the offset for pagination

    try:
        # Fetch total rows for pagination
        count_query, count_params = build_query(
            year=year, month=month, probe_id=probe_id, measurement_id=measurement_id,
            group_by=group_by, count_only=True
        )
        total_data = execute_query(count_query, count_params)
        total_rows = total_data[0]['total_rows'] if total_data else 0

        # Return a message if no data is found
        if total_rows == 0:
            return make_response(jsonify({'error': 'No data found.'}), 200, headers)

        # Calculate pagination details
        total_pages = (total_rows + page_size - 1) // page_size
        has_more = page < total_pages

        # Fetch the actual data with pagination
        data_query, data_params = build_query(
            year=year, month=month, probe_id=probe_id, measurement_id=measurement_id,
            group_by=group_by, page_size=page_size, offset=offset
        )
        data = execute_query(data_query, data_params)

        # Return the response with data and pagination details
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
    
    # Handle various error cases
    except ValueError as e:
        return error_response(str(e), 400)
    except NotFound:
        return error_response("BigQuery dataset or table not found.", 404)
    except BadRequest as e:
        return error_response("Bad request to BigQuery.", 400)
    except Exception as e:
        logger.exception("Unexpected error occurred.")  # Log unexpected errors
        return error_response("An unexpected error occurred.", 500)
