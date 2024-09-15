import functions_framework
from flask import jsonify, request, make_response
from google.cloud import bigquery
import logging
from google.cloud.exceptions import NotFound, BadRequest

# Initialize BigQuery client
bq_client = bigquery.Client()

# Set up logging
logging.basicConfig(level=logging.INFO)

# Replace with your BigQuery dataset and table names
BIGQUERY_DATASET = 'MeasurementLab'
BIGQUERY_TABLE = 'upload'

# Constants for pagination limits
DEFAULT_PAGE_SIZE = 500
MAX_PAGE_SIZE = 5000

# Valid metric options (without num_tests)
VALID_METRICS = {
    'avg_upload_speed_mbps': 'Average Upload Speed (Mbps)',
    'avg_latency_ms': 'Average Latency (ms)'
}

# Custom error handling function
def create_error_response(message, status_code=400):
    """Helper function to create a consistent error response."""
    logging.error(message)
    return make_response(jsonify({'error': message}), status_code)

# Custom validator for integer parameters
def validate_integer(param_name, param_value):
    """Helper function to validate an integer parameter."""
    try:
        return int(param_value)
    except (ValueError, TypeError):
        logging.warning(f"Invalid {param_name}: {param_value}. Expected an integer.")
        return None

# Custom validator for float parameters
def validate_float(param_name, param_value):
    """Helper function to validate a float parameter."""
    try:
        return float(param_value)
    except (ValueError, TypeError):
        logging.warning(f"Invalid {param_name}: {param_value}. Expected a float.")
        return None

# Validator for latitude and longitude
def validate_latitude_longitude(latitude, longitude):
    """Validate latitude and longitude ranges."""
    if latitude and not (-90 <= latitude <= 90):
        return False, "Latitude must be between -90 and 90."
    if longitude and not (-180 <= longitude <= 180):
        return False, "Longitude must be between -180 and 180."
    return True, None

# Main cloud function
@functions_framework.http
def get_network_data(request):
    """
    Cloud Function to fetch BigQuery data based on various filters. Supports pagination and metric selection.
    Metrics supported: avg_upload_speed_mbps, avg_latency_ms.
    """
    # Extract query parameters
    country = request.args.get('country')
    year = request.args.get('year')
    month = request.args.get('month')
    region = request.args.get('region')
    city = request.args.get('city')
    latitude = request.args.get('latitude')
    longitude = request.args.get('longitude')
    as_number = request.args.get('as_number')
    as_name = request.args.get('as_name')
    metric = request.args.get('metric', 'avg_upload_speed_mbps')  # Default to avg_upload_speed_mbps
    page = request.args.get('page', 1)
    page_size = request.args.get('page_size', DEFAULT_PAGE_SIZE)

    # Validate required 'country' parameter
    if not country:
        return create_error_response('Missing required "country" query parameter.', 400)

    # Validate optional parameters
    year = validate_integer("year", year)
    month = validate_integer("month", month)
    latitude = validate_float("latitude", latitude)
    longitude = validate_float("longitude", longitude)
    as_number = validate_integer("as_number", as_number)

    # Validate latitude and longitude ranges
    valid_lat_lon, lat_lon_error_message = validate_latitude_longitude(latitude, longitude)
    if not valid_lat_lon:
        return create_error_response(lat_lon_error_message, 400)

    # Validate pagination parameters
    try:
        page = int(page)
        page_size = min(int(page_size), MAX_PAGE_SIZE)  # Limit page_size to MAX_PAGE_SIZE
        if page < 1 or page_size < 1:
            raise ValueError
    except ValueError:
        return create_error_response('Invalid pagination parameters.', 400)

    # Validate the metric selection
    if metric not in VALID_METRICS:
        return create_error_response(f'Invalid metric "{metric}". Choose between: {", ".join(VALID_METRICS.keys())}.', 400)

    # Build base query
    query = f"""
    SELECT year, month, country, region, city, latitude, longitude, as_number, as_name, {metric}
    FROM `{BIGQUERY_DATASET}.{BIGQUERY_TABLE}`
    WHERE country = @country
    """

    # Build query parameters
    query_params = [bigquery.ScalarQueryParameter("country", "STRING", country)]

    # Add optional filters
    optional_filters = [
        ("year", year, "INT64"),
        ("month", month, "INT64"),
        ("region", region, "STRING"),
        ("city", city, "STRING"),
        ("latitude", latitude, "FLOAT64"),
        ("longitude", longitude, "FLOAT64"),
        ("as_number", as_number, "INT64"),
        ("as_name", as_name, "STRING")
    ]

    for param_name, param_value, param_type in optional_filters:
        if param_value is not None:
            query += f" AND {param_name} = @{param_name}"
            query_params.append(bigquery.ScalarQueryParameter(param_name, param_type, param_value))

    # Add pagination with OFFSET
    offset = (page - 1) * page_size
    query += f" LIMIT @page_size OFFSET @offset"
    query_params.append(bigquery.ScalarQueryParameter("page_size", "INT64", page_size))
    query_params.append(bigquery.ScalarQueryParameter("offset", "INT64", offset))

    # Execute the query
    try:
        job_config = bigquery.QueryJobConfig(query_parameters=query_params)
        logging.info(f"Executing query for country: {country}, metric: {metric}, page: {page}")
        query_job = bq_client.query(query, job_config=job_config)

        # Fetch results
        results = query_job.result()
        data = [dict(row) for row in results]

        # If no data is found
        if not data:
            logging.info(f"No data found for country: {country} with the applied filters.")
            return make_response(jsonify({'message': 'No data found for the given parameters'}), 404)

        # Return data with pagination metadata
        logging.info(f"Query successful for country: {country}")
        return make_response(jsonify({
            'data': data,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'has_more': len(data) == page_size  # If the data size matches the page size, there might be more data
            }
        }), 200)

    except NotFound as e:
        return create_error_response(f'Dataset or table not found: {e}', 404)

    except BadRequest as e:
        return create_error_response(f'Bad request: {e}', 400)

    except Exception as e:
        return create_error_response(f'Unexpected error: {e}', 500)
