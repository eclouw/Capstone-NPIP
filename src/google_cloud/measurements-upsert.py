import requests
import logging
import json
from google.cloud import pubsub_v1
from ripe.atlas.sagan import PingResult

# Configure logging
logging.basicConfig(level=logging.INFO)

# Constants for Pub/Sub
PROJECT_ID = 'project-npip'
TOPIC_ID = 'measurement-upsert-queue'

# Initialize Pub/Sub client
publisher = pubsub_v1.PublisherClient()
topic_path = publisher.topic_path(PROJECT_ID, TOPIC_ID)

def fetch_and_process_measurement_data(request):
    """
    Cloud Function to fetch RIPE Atlas measurement data, calculate RTT metrics, 
    and publish the results to a Pub/Sub topic.
    """
    try:
        # Parse the request JSON data
        request_data = request.get_json()
        if not request_data:
            logging.error("No JSON data found in the request.")
            return json.dumps({"status": "Invalid request data"}), 400

        # Extract and validate required fields
        required_fields = ['measurement_id', 'probe_id', 'start', 'stop', 'year', 'month']
        missing_fields = [field for field in required_fields if field not in request_data]
        
        if missing_fields:
            logging.error(f"Missing required fields: {missing_fields}")
            return json.dumps({"status": f"Missing fields: {missing_fields}"}), 400
        
        measurement_id = request_data['measurement_id']
        probe_id = request_data['probe_id']
        start = request_data['start']
        stop = request_data['stop']
        year = request_data['year']
        month = request_data['month']

        # Fetch measurement data from RIPE Atlas
        measurement_data = fetch_measurement_data(measurement_id, probe_id, start, stop)
        if not measurement_data:
            return json.dumps({"status": "No data fetched"}), 200

        # Compute RTT metrics
        rtt_metrics = calculate_rtt_metrics(measurement_data)
        if not rtt_metrics:
            logging.info("No valid RTT data found.")
            return json.dumps({"status": "No valid RTT data"}), 200

        # Publish metrics to Pub/Sub
        publish_to_pubsub(rtt_metrics, measurement_id, probe_id, year, month)

        logging.info(f"Successfully processed data for Measurement {measurement_id}, Probe {probe_id}")
        return json.dumps({"status": "Data processed successfully", "rtt_metrics": rtt_metrics}), 200

    except requests.RequestException as e:
        logging.error(f"Error fetching data: {e}")
        return json.dumps({"status": "Error fetching data"}), 500

    except Exception as e:
        logging.error(f"Unexpected error during processing: {e}")
        return json.dumps({"status": "Error processing data"}), 500

def fetch_measurement_data(measurement_id, probe_id, start, stop):
    """
    Fetches RIPE Atlas measurement data for the given measurement and probe IDs 
    within the specified start and stop time.
    """
    url = f"https://atlas.ripe.net/api/v2/measurements/{measurement_id}/results/"
    params = {"format": "json", "start": start, "stop": stop, "probe_ids": str(probe_id)}

    try:
        response = requests.get(url, params=params, timeout=30)
        
        if response.status_code == 404:
            logging.warning(f"Measurement data not found for Measurement {measurement_id}, Probe {probe_id}.")
            return None
        
        response.raise_for_status()  # Raise HTTPError for bad status codes
        logging.info(f"Successfully fetched data for Measurement {measurement_id}, Probe {probe_id}.")
        return response.json()

    except requests.exceptions.HTTPError as e:
        logging.error(f"HTTP error while fetching measurement data: {e}")
        if response.status_code != 404:
            raise
        return None

    except requests.RequestException as e:
        logging.error(f"Error fetching measurement data: {e}")
        raise

def calculate_rtt_metrics(data):
    """
    Calculates RTT metrics (average, min, max, count) from the fetched measurement data.
    Returns a dictionary with the RTT metrics, or None if no valid RTT data is found.
    """
    rtt_values = [PingResult(result).rtt_average for result in data if PingResult(result).rtt_average is not None]

    if not rtt_values:
        return None

    avg_rtt = sum(rtt_values) / len(rtt_values)
    min_rtt = min(rtt_values)
    max_rtt = max(rtt_values)
    num_measurements = len(rtt_values)

    logging.info(
        f"RTT Metrics - Avg: {avg_rtt:.2f} ms, Min: {min_rtt:.2f} ms, Max: {max_rtt:.2f} ms, Count: {num_measurements}"
    )

    return {
        "avg_rtt": avg_rtt,
        "min_rtt": min_rtt,
        "max_rtt": max_rtt,
        "num_measurements": num_measurements
    }

def publish_to_pubsub(rtt_metrics, measurement_id, probe_id, year, month):
    """
    Publishes the RTT metrics to the Pub/Sub topic.
    """
    message_data = {
        "measurement_id": measurement_id,
        "probe_id": probe_id,
        "avg_rtt": rtt_metrics['avg_rtt'],
        "min_rtt": rtt_metrics['min_rtt'],
        "max_rtt": rtt_metrics['max_rtt'],
        "num_measurements": rtt_metrics['num_measurements'],
        "year": year,
        "month": month
    }

    message_bytes = json.dumps(message_data).encode("utf-8")

    try:
        future = publisher.publish(topic_path, data=message_bytes)
        logging.info(f"Published message for Measurement {measurement_id}, Probe {probe_id} to Pub/Sub. Message ID: {future.result()}")
    except Exception as e:
        logging.error(f"Failed to publish message to Pub/Sub for Measurement {measurement_id}, Probe {probe_id}: {e}")
        raise RuntimeError(f"Pub/Sub publishing failed: {e}")
