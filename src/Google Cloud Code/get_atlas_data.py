import requests
from ripe.atlas.sagan import PingResult
from google.cloud import bigquery

def atlas_to_bigquery(request):
    # Base URL for the initial query
    url = "https://atlas.ripe.net/api/v2/anchors/"

    # Parameters for the initial query
    params = {
        "country": "ZA"  # Country code for South Africa
    }

    # Dictionary to store the raw results
    measurements_dict = {}

    # Function to process each anchor object and retrieve measurements
    def process_anchor(anchor):
        probe_id = anchor.get('probe')
        if probe_id:
            measurement_url = f"https://atlas.ripe.net/api/v2/measurements/1/results/"
            measurement_params = {
                "probe_ids": probe_id,
                "start": 1723507200,  # Example start timestamp
                "stop": 1723593599,   # Example stop timestamp
                "format": "json"
            }
            
            measurement_response = requests.get(measurement_url, params=measurement_params)
            measurement_data = measurement_response.json()
            measurements_dict[probe_id] = measurement_data
            print(f"Retrieved data for Probe ID: {probe_id}")

    # Make the initial request to get anchors
    response = requests.get(url, params=params)
    data = response.json()

    if data:
        anchors = data.get('results', [])
        for anchor in anchors:
            process_anchor(anchor)

    # Dictionary to store processed data for BigQuery
    rows_to_insert = []

    for probe_id, measurements in measurements_dict.items():
        for measurement in measurements:
            try:
                ping_result = PingResult(measurement)
                
                # Extract desired information
                row = {
                    "probe_id": probe_id, "af": ping_result.af, "rtt_average": ping_result.rtt_average, "rtt_min": ping_result.rtt_min, "rtt_max": ping_result.rtt_max, "packets_sent": ping_result.packets_sent, "packets_received": ping_result.packets_received, "packet_size": ping_result.packet_size, "destination_name": ping_result.destination_name, "destination_address": ping_result.destination_address
                }
                
                rows_to_insert.append(row)
                print(f"Prepared row for Probe ID: {probe_id}")

            except Exception as e:
                print(f"Failed to process measurement for Probe ID: {probe_id}. Error: {e}")

    # Insert rows into BigQuery
    client = bigquery.Client()
    table_id = "avian-buffer-431609-f7.npip-capstone.DataRipeAtlas"  # table ID

    errors = client.insert_rows_json(table_id, rows_to_insert)  # Insert data into BigQuery
    if errors:
        print(f"Errors occurred while inserting rows: {errors}")
    else:
        print(f"Successfully inserted {len(rows_to_insert)} rows into BigQuery.")

    return "Data processing complete."
