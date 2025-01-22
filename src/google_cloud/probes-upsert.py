import requests
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from google.cloud import bigquery
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)

# BigQuery client
client = bigquery.Client()
dataset_id = 'project-npip.RipeAtlas'
staging_table_id = f"{dataset_id}.probes_staging"  # Staging table ID
table_id = f"{dataset_id}.probes"  # Main table ID

# Constants
BASE_URL = "https://atlas.ripe.net/api/v2/probes/?format=json&is_public=true&status={}&country_code={}"
VALID_TAGS = {"system-v1", "system-v2", "system-v3", "system-v4", "system-v5", "system-software", "system-anchor"}
COUNTRY_CODES = [
    "DZ", "AO", "BJ", "BW", "BF", "BI", "CV", "CM", "CF", "TD", "KM", "CD", "CG", "CI", "DJ", "EG", 
    "GQ", "ER", "SZ", "ET", "GA", "GM", "GH", "GN", "GW", "KE", "LS", "LR", "LY", "MG", "MW", "ML", 
    "MR", "MU", "MA", "MZ", "NA", "NE", "NG", "RW", "ST", "SN", "SC", "SL", "SO", "ZA", "SS", "SD", 
    "TZ", "TG", "TN", "UG", "ZM", "ZW"
]
STATUS_IDS = [1, 2]
BATCH_SIZE = 100

def fetch_probe_data(status_id, country_code):
    """
    Fetches probe data from the RIPE Atlas API for a given status and country code.
    Returns a list of results or an empty list if the request fails.
    """
    url = BASE_URL.format(status_id, country_code)
    results = []
    
    try:
        while url:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
            results.extend(parse_probe_data(data['results']))
            url = data.get('next')
        logging.info(f"Fetched {len(results)} probes for status {status_id}, country {country_code}.")
    except requests.RequestException as e:
        logging.error(f"Error fetching data for status {status_id}, country {country_code}: {e}")
    
    return results

def parse_probe_data(probe_results):
    """
    Parses the probe results and extracts relevant fields for BigQuery.
    """
    return [
        {
            "id": probe['id'],
            "country_code": probe['country_code'],
            "geometry": probe.get('geometry'),
            "is_anchor": probe['is_anchor'],
            "supports_v4": bool(probe.get('prefix_v4')),  # Check if IPv4 is supported
            "supports_v6": bool(probe.get('prefix_v6')),  # Check if IPv6 is supported
            "status_id": probe['status']['id'],
            # Convert status_since to a string in 'YYYY-MM-DD' format
            "status_since": datetime.fromtimestamp(probe['status_since']).strftime('%Y-%m-%d') if probe.get('status_since') else None,
            "system_type": next((t['slug'] for t in probe['tags'] if t['slug'] in VALID_TAGS), None)
        }
        for probe in probe_results
    ]

def parse_geometry(geometry):
    """
    Extracts and returns the latitude and longitude from the geometry field.
    Returns None if coordinates are not available.
    """
    coordinates = geometry.get('coordinates', []) if geometry else []
    if len(coordinates) == 2:
        return {'lat': coordinates[1], 'lng': coordinates[0]}  # Lat is Y, Lng is X
    return None

def batch_insert_bigquery(probe_data_list):
    """
    Inserts probe data into the staging table in BigQuery in batches.
    """
    rows_to_insert = []
    
    for probe_data in probe_data_list:
        # Parse and add location data
        location = parse_geometry(probe_data['geometry'])
        if location:
            probe_data['lat'] = location['lat']
            probe_data['lng'] = location['lng']
        probe_data.pop('geometry', None)  # Remove geometry field
        
        # Prepare row for BigQuery insertion
        row = {
            "id": probe_data['id'],
            "country_code": probe_data['country_code'],
            "is_anchor": probe_data['is_anchor'],
            "supports_v4": probe_data['supports_v4'], 
            "supports_v6": probe_data['supports_v6'], 
            "status_id": probe_data['status_id'],
            "status_since": probe_data['status_since'],
            "system_type": probe_data['system_type'],
            "lat": probe_data.get('lat'),
            "lng": probe_data.get('lng'),
        }
        rows_to_insert.append(row)
    
    # Insert rows into the staging table
    errors = client.insert_rows_json(staging_table_id, rows_to_insert)
    if errors == []:
        logging.info(f"Batch of {len(rows_to_insert)} probes inserted into staging table.")
    else:
        logging.error(f"Failed to insert rows into the staging table: {errors}")

def handle_request(request):
    """
    Main function to handle the request, fetch probe data concurrently,
    and insert into BigQuery with the results.
    """
    try:
        all_results = []

        # Fetch data concurrently for all statuses and country codes
        with ThreadPoolExecutor() as executor:
            futures = [
                executor.submit(fetch_probe_data, status_id, country_code)
                for status_id in STATUS_IDS for country_code in COUNTRY_CODES
            ]
            
            for future in as_completed(futures):
                results = future.result()
                all_results.extend(results)

        logging.info(f"Total probes fetched: {len(all_results)}.")

        # Batch insert the fetched data to BigQuery staging table in chunks
        for i in range(0, len(all_results), BATCH_SIZE):
            batch_insert_bigquery(all_results[i:i + BATCH_SIZE])

        logging.info("Data processing and staging table inserts completed successfully.")
        return "Data processed and inserted into staging table successfully", 200

    except Exception as e:
        logging.error(f"Error in handle_request: {e}")
        return "Error processing request", 500
