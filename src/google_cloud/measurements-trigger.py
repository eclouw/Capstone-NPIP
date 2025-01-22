import logging
from google.cloud import bigquery, tasks_v2
from datetime import datetime
import json
import calendar
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s: %(message)s')

# Constants
MEASUREMENT_IDS = [
    1009, 1010, 1011, 1012, 1013, 1004, 1014, 1015, 1005, 1016, 
    1001, 1008, 1006, 1030, 1031, 1029, 1028, 1017, 1019, 1027,
    61221646, 61221412, 61222902, 61221571, 61221506, 61221503, ## google, facebook, microsoft, netflix, amazon, apple, cloudfare
    61221393
]
PROJECT_ID = 'project-npip'
DATASET_ID = 'RipeAtlas'
TABLE_ID = 'measurements'
QUEUE_NAME = 'measurements-get-queue'
REGION = 'us-central1'
FUNCTION_URL = "https://measurements-upsert-86452853723.us-central1.run.app"
SERVICE_ACCOUNT_EMAIL = 'admin-npip@project-npip.iam.gserviceaccount.com'

# Initialize clients
bigquery_client = bigquery.Client()
tasks_client = tasks_v2.CloudTasksClient()
QUEUE_PATH = tasks_client.queue_path(PROJECT_ID, REGION, QUEUE_NAME)

def fetch_latest_year_month():
    """Fetches the latest year and month combination from BigQuery."""
    query = f"""
    SELECT year, month
    FROM {PROJECT_ID}.{DATASET_ID}.{TABLE_ID}
    WHERE year IS NOT NULL AND month IS NOT NULL
    ORDER BY year DESC, month DESC
    LIMIT 1
    """
    logging.info("Fetching the latest year and month from BigQuery...")
    
    try:
        start_time = time.time()
        result = bigquery_client.query(query).result()
        row = next(result, None)
        
        if row:
            latest_year, latest_month = row.year, row.month
            logging.info(
                f"Latest data found: Year {latest_year}, Month {latest_month} "
                f"(Time taken: {time.time() - start_time:.2f} seconds)"
            )
            return latest_year, latest_month
        else:
            logging.warning("No data found for year and month.")
            return None, None

    except Exception as e:
        logging.error(f"Error fetching latest year and month from BigQuery: {e}")
        raise RuntimeError(f"BigQuery query failed: {e}")

def fetch_probe_ids():
    """Retrieves all probe IDs from BigQuery."""
    logging.info("Fetching probe IDs from BigQuery...")
    
    query = f"""
    SELECT id
    FROM `{PROJECT_ID}.{DATASET_ID}.probes`
    WHERE id IS NOT NULL
    """
    
    try:
        start_time = time.time()
        result = bigquery_client.query(query).result()
        probe_ids = [row.id for row in result]
        
        logging.info(
            f"Retrieved {len(probe_ids)} probe IDs from BigQuery "
            f"(Time taken: {time.time() - start_time:.2f} seconds)"
        )
        return probe_ids
    except Exception as e:
        logging.error(f"Error fetching probe IDs from BigQuery: {e}")
        raise RuntimeError(f"BigQuery fetch failed: {e}")

def create_cloud_task(measurement_id, probe_id, start, stop, year, month):
    """Creates a Cloud Task for a given measurement and probe."""
    task_payload = {
        "http_method": tasks_v2.HttpMethod.POST,
        "url": FUNCTION_URL,
        "body": json.dumps({
            "measurement_id": measurement_id,
            "probe_id": probe_id,
            "start": start,
            "stop": stop,
            "year": year,
            "month": month
        }).encode(),
        "headers": {"Content-Type": "application/json"},
        "oidc_token": {"service_account_email": SERVICE_ACCOUNT_EMAIL}
    }
    task = {"http_request": task_payload}

    try:
        response = tasks_client.create_task(parent=QUEUE_PATH, task=task)
        logging.info(
            f"Created task for Measurement {measurement_id}, Probe {probe_id}, {year}-{month}. "
            f"Task Name: {response.name}"
        )
    except Exception as e:
        logging.error(f"Failed to create task for Measurement {measurement_id}, Probe {probe_id}: {e}")
        raise RuntimeError(f"Task creation failed: {e}")

def create_tasks_parallel(measurement_id, probe_ids, start_date, end_date, year, month):
    """Creates tasks in parallel for each measurement and probe using ThreadPoolExecutor."""
    logging.info(
        f"Creating tasks for Measurement {measurement_id} for Year {year}, Month {month} "
        f"(Probes: {len(probe_ids)})."
    )
    start_time = time.time()
    futures = []

    with ThreadPoolExecutor() as executor:
        for probe_id in probe_ids:
            futures.append(
                executor.submit(
                    create_cloud_task,
                    measurement_id,
                    probe_id,
                    int(start_date.timestamp()),
                    int(end_date.timestamp()),
                    year,
                    month
                )
            )
        for future in as_completed(futures):
            try:
                future.result()
            except Exception as exc:
                logging.error(f"Task creation generated an exception: {exc}")

    logging.info(
        f"Completed task creation for Measurement {measurement_id}, Year {year}, Month {month} "
        f"(Time taken: {time.time() - start_time:.2f} seconds)."
    )

def trigger_population(request):
    """
    Cloud Function entry point to trigger the population of RIPE Atlas measurement tasks.
    """

    try:
        logging.info("Starting the data population process...")

        probe_ids = fetch_probe_ids()
        if not probe_ids:
            logging.warning("No probe IDs found.")
            return ('No probe IDs found', 500)

        latest_year, latest_month = fetch_latest_year_month()
        if latest_year is None or latest_month is None:
            logging.info("No data in BigQuery. Starting from January 2020.")
            latest_year, latest_month = 2020, 1

        current_year, current_month = datetime.now().year, datetime.now().month

        for measurement_id in MEASUREMENT_IDS:
            for year in range(latest_year, current_year + 1):
                start_month = latest_month if year == latest_year else 1
                months_range = (
                    range(start_month, 13) if year < current_year 
                    else range(start_month, current_month + 1)
                )

                for month in months_range:
                    start_date = datetime(year, month, 1)
                    end_date = datetime(year, month, calendar.monthrange(year, month)[1], 23, 59, 59)

                    create_tasks_parallel(
                        measurement_id,
                        probe_ids,
                        start_date,
                        end_date,
                        year,
                        month
                    )

        logging.info("Data population process successfully completed.")
        return ('Data population triggered successfully', 200)

    except Exception as e:
        logging.error(f"Error during data population trigger: {e}")
        return (f"Internal error: {e}", 500)
