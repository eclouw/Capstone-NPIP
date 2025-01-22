-- Declare a variable to hold the latest upload date
DECLARE latest_upload_date DATE;

-- Set the value of 'latest_upload_date' by querying the 'latest_upload_date' 
-- from the 'Utils.Mlab_dates' table in the 'project-npip' dataset.
SET latest_upload_date = (SELECT latest_upload_date FROM `project-npip.Utils.Mlab_dates`);

-- Use EXECUTE IMMEDIATE to run a dynamic SQL statement. This allows SQL to 
-- dynamically build the query based on the 'latest_upload_date'.
EXECUTE IMMEDIATE '''

  -- MERGE statement to update or insert data into the 'upload' table in the 
  -- 'MeasurementLab' dataset of the 'project-npip' project.
  MERGE project-npip.MeasurementLab.upload T
  USING (
    -- Subquery to fetch the aggregated upload speed data
    SELECT
      EXTRACT(YEAR FROM a.TestTime) AS year,                -- Extract the year from the TestTime
      EXTRACT(MONTH FROM a.TestTime) AS month,              -- Extract the month from the TestTime
      client.Geo.CountryCode AS country,                    -- Get the country code
      client.Geo.Subdivision1Name AS region,                -- Get the region (state/province)
      client.Geo.City AS city,                              -- Get the city name
      client.Geo.Latitude AS latitude,                      -- Get the latitude
      client.Geo.Longitude AS longitude,                    -- Get the longitude
      client.Network.ASNumber AS as_number,                 -- Get the AS (Autonomous System) number
      client.Network.ASName AS as_name,                     -- Get the AS name
      AVG(a.MeanThroughputMbps) AS avg_upload_speed_mbps,   -- Calculate average upload speed in Mbps
      AVG(a.MinRTT) AS avg_latency_ms,                      -- Calculate average latency in milliseconds
      COUNT(*) AS num_tests                                 -- Count the number of tests
    FROM
      `measurement-lab.ndt.unified_uploads`      -- Source table containing upload test data
    WHERE
      date >= "''' || CAST(latest_upload_date AS STRING) || '''"  -- Only include records from the latest upload date onwards
      AND client.Geo.CountryCode IN (   -- Filter the data to include only countries in Africa (country codes specified)
          'DZ', 'AO', 'BJ', 'BW', 'BF', 'BI', 'CV', 'CM', 'CF', 'TD', 'KM', 'CD', 
          'DJ', 'EG', 'GQ', 'ER', 'SZ', 'ET', 'GA', 'GM', 'GH', 'GN', 'GW', 'CI', 
          'KE', 'LS', 'LR', 'LY', 'MG', 'MW', 'ML', 'MR', 'MU', 'MA', 'MZ', 'NA', 
          'NE', 'NG', 'RW', 'ST', 'SN', 'SC', 'SL', 'SO', 'ZA', 'SS', 'SD', 'TZ', 
          'TG', 'TN', 'UG', 'ZM', 'ZW'
      )
      AND IsValidBest = TRUE             -- Include only valid tests
    GROUP BY
      year, month, country, region, city, latitude, longitude, as_number, as_name  -- Group by these dimensions
  ) S
  ON T.year = S.year
  AND T.month = S.month
  AND T.country = S.country
  AND T.region = S.region
  AND T.city = S.city
  AND T.latitude = S.latitude
  AND T.longitude = S.longitude
  AND T.as_number = S.as_number
  AND T.as_name = S.as_name

  -- If a matching row is found in the target table (T), update the data.
  WHEN MATCHED THEN
    UPDATE SET
      T.avg_upload_speed_mbps = S.avg_upload_speed_mbps,  -- Update average upload speed
      T.avg_latency_ms = S.avg_latency_ms,                -- Update average latency
      T.num_tests = S.num_tests                           -- Update the number of tests

  -- If no matching row is found in the target table, insert the new data.
  WHEN NOT MATCHED THEN
    INSERT (
      year,
      month,
      country,
      region,
      city,
      latitude,
      longitude,
      as_number,
      as_name,
      avg_upload_speed_mbps,
      avg_latency_ms,
      num_tests
    )
    VALUES (
      S.year,
      S.month,
      S.country,
      S.region,
      S.city,
      S.latitude,
      S.longitude,
      S.as_number,
      S.as_name,
      S.avg_upload_speed_mbps,
      S.avg_latency_ms,
      S.num_tests
    );
''';
