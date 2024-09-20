import functions_framework
from flask import jsonify, request, make_response
from google.cloud import bigquery
import logging
from google.cloud.exceptions import NotFound, BadRequest
from typing import Optional, Any, Tuple, List, Dict

# Configure logging
logger = logging.getLogger('google_cloud_functions')

# Constants for BigQuery dataset and table names
BIGQUERY_DATASET = 'RipeAtlas'
BIGQUERY_TABLE = 'measurements'

# Constants for pagination and validation
DEFAULT_PAGE_SIZE = 100
MAX_PAGE_SIZE = 5000

def validate_integer(param_name: str, param_value: Any) -> Optional[int]:
    """
    Validates if a query parameter is a valid integer.
    Returns the integer if valid, otherwise logs a warning and returns None.
    """
    try:
        return int(param_value)
    except (ValueError, TypeError):
        logger.warning(f"Invalid {param_name} format: {param_value}. Expected an integer.")
        return None

def get_total_rows(probe_id: int, measurement_id: Optional[int] = None, year: Optional[int] = None, month: Optional[int] = None) -> int:
    """
    Fetches the total number of rows for the query based on the provided filter conditions.
    Constructs and executes a BigQuery COUNT query using the filter parameters.
    """
    query_conditions = ["probe_id = @probe_id"]  # Required condition
    query_params = [bigquery.ScalarQueryParameter("probe_id", "INT64", probe_id)]  # Required query parameter

    # Add optional filtering conditions based on the passed parameters
    if measurement_id is not None:
        query_conditions.append("measurement_id = @measurement_id")
        query_params.append(bigquery.ScalarQueryParameter("measurement_id", "INT64", measurement_id))
    
    if year is not None:
        query_conditions.append("year = @year")
        query_params.append(bigquery.ScalarQueryParameter("year", "INT64", year))
    
    if month is not None:
        query_conditions.append("month = @month")
        query_params.append(bigquery.ScalarQueryParameter("month", "INT64", month))

    # BigQuery SQL to count rows
    count_query = f"""
    SELECT COUNT(*) as total_rows
    FROM `{BIGQUERY_DATASET}.{BIGQUERY_TABLE}`
    WHERE {" AND ".join(query_conditions)}
    """
    
    bq_client = bigquery.Client() 
    job_config = bigquery.QueryJobConfig(query_parameters=query_params)  # Configure the query job with parameters
    query_job = bq_client.query(count_query, job_config=job_config)
    results = query_job.result()

    return next(iter(results)).total_rows  # Return the total row count from the result

def build_measurements_query(
    probe_id: int,
    measurement_id: Optional[int] = None,
    year: Optional[int] = None,
    month: Optional[int] = None,
    page_size: int = DEFAULT_PAGE_SIZE,
    offset: int = 0
) -> Tuple[str, List[bigquery.ScalarQueryParameter]]:
    """
    Constructs a BigQuery SQL query for the measurements table based on filter conditions.
    Uses parameterized queries to prevent SQL injection and allows pagination.
    """
    query_conditions = ["probe_id = @probe_id"]  # Base condition
    query_params = [bigquery.ScalarQueryParameter("probe_id", "INT64", probe_id)]  # Base query parameter

    # Append additional filtering conditions if provided
    if measurement_id is not None:
        query_conditions.append("measurement_id = @measurement_id")
        query_params.append(bigquery.ScalarQueryParameter("measurement_id", "INT64", measurement_id))
    
    if year is not None:
        query_conditions.append("year = @year")
        query_params.append(bigquery.ScalarQueryParameter("year", "INT64", year))
    
    if month is not None:
        query_conditions.append("month = @month")
        query_params.append(bigquery.ScalarQueryParameter("month", "INT64", month))

    # BigQuery SQL to select data with pagination
    query = f"""
    SELECT
        measurement_id, probe_id, avg_rtt, min_rtt, max_rtt, num_measurements, year, month
    FROM `{BIGQUERY_DATASET}.{BIGQUERY_TABLE}`
    WHERE {" AND ".join(query_conditions)}
    LIMIT @page_size OFFSET @offset
    """

    query_params.append(bigquery.ScalarQueryParameter("page_size", "INT64", page_size))  # Add page size parameter
    query_params.append(bigquery.ScalarQueryParameter("offset", "INT64", offset))  # Add offset for pagination

    return query, query_params  # Return the constructed query and parameters

def execute_query(query: str, query_params: List[bigquery.ScalarQueryParameter]) -> List[Dict[str, Any]]:
    """
    Executes the provided BigQuery query and returns the results as a list of dictionaries.
    """
    bq_client = bigquery.Client()
    job_config = bigquery.QueryJobConfig(query_parameters=query_params)  # Configure the query job
    query_job = bq_client.query(query, job_config=job_config)  # Execute the query
    results = query_job.result()
    return [dict(row) for row in results]  # Convert rows to list of dictionaries and return

def error_response(message: str, status_code: int) -> Any:
    """
    Generates an error response with the specified status code and logs the error message.
    Returns a JSON response with an error message.
    """
    logger.error(f"Status {status_code}: {message}")
    return make_response(jsonify({'error': message}), status_code)  # Return the error response

@functions_framework.http
def get_measurement_data(request) -> Any:
    """
    Handles HTTP requests for retrieving measurement data.
    Validates query parameters, constructs the query, executes it, and returns paginated results.
    """
    headers = {
        "Access-Control-Allow-Origin": "*",  # Allow CORS
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",  # Allowed methods
        "Access-Control-Allow-Headers": "Content-Type",  # Allowed headers
        "Access-Control-Max-Age": "3600",  # Cache preflight responses for 1 hour
    }

    # Retrieve query parameters
    args = request.args

    # Validate probe_id as required parameter
    probe_id = validate_integer("probe_id", args.get('probe_id'))
    if probe_id is None:
        return error_response('Invalid probe_id. It is required and must be an integer.', 400)

    # Validate optional parameters
    measurement_id = validate_integer("measurement_id", args.get('measurement_id'))
    year = validate_integer("year", args.get('year')) if args.get('year') else None
    month = validate_integer("month", args.get('month')) if args.get('month') else None

    # Validate year and month ranges
    if year and (year < 2000 or year > 2100):  # Adjust range as necessary
        return error_response('Invalid year. Must be between 2000 and 2100.', 400)

    if month and (month < 1 or month > 12):
        return error_response('Invalid month. Must be between 1 and 12.', 400)

    # Validate pagination parameters
    page = validate_integer('page', args.get('page')) or 1  # Default to page 1
    if page < 1:
        return error_response('Invalid page number. Page must be greater than or equal to 1.', 400)

    # Set page size within bounds
    page_size = min(validate_integer('page_size', args.get('page_size')) or DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE)
    offset = (page - 1) * page_size  # Calculate offset for pagination

    try:
        # Get the total number of rows for pagination metadata
        total_rows = get_total_rows(probe_id=probe_id, measurement_id=measurement_id, year=year, month=month)
        total_pages = (total_rows + page_size - 1) // page_size  # Calculate total number of pages

        if total_rows == 0:
            return make_response(jsonify({'data': [], 'message': 'No data found for the given parameters.'}), 200, headers)

        if offset >= total_rows:
            return error_response('Page number exceeds available data.', 400)

        # Build and execute the query
        query, query_params = build_measurements_query(
            probe_id=probe_id,
            measurement_id=measurement_id,
            year=year,
            month=month,
            page_size=page_size,
            offset=offset
        )
        
        data = execute_query(query, query_params)

        # Return paginated results with metadata
        response = {
            'data': data,
            'total_rows': total_rows,
            'total_pages': total_pages,
            'current_page': page,
            'next_page': page + 1 if page < total_pages else None
        }

        return make_response(jsonify(response), 200, headers)  # Return success response

    except Exception as e:
        logger.exception("Error occurred during query execution.")
        return error_response("An error occurred during query execution.", 500)
