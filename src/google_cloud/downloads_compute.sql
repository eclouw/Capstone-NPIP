-- Declare a variable to hold the latest download date
DECLARE latest_download_date DATE;

-- Set the variable `latest_download_date` by selecting it from a utility table
SET latest_download_date = (SELECT latest_download_date FROM `project-npip.Utils.Mlab_dates`);

-- Use EXECUTE IMMEDIATE to dynamically build and execute a SQL statement
EXECUTE IMMEDIATE '''
  -- Merge the data from the M-Lab download dataset into an existing table
  MERGE project-npip.MeasurementLab.download T
  USING (
    -- Select relevant fields and compute aggregates from the source dataset
    SELECT
      -- Extract the year and month from the test timestamp
      EXTRACT(YEAR FROM a.TestTime) AS year,
      EXTRACT(MONTH FROM a.TestTime) AS month,
      -- Geo information of the client
      client.Geo.CountryCode AS country,
      client.Geo.Subdivision1Name AS region,
      client.Geo.City AS city,
      client.Geo.Latitude AS latitude,
      client.Geo.Longitude AS longitude,
      -- Network information of the client
      client.Network.ASNumber AS as_number,
      client.Network.ASName AS as_name,
      -- Aggregation of performance metrics
      AVG(a.MeanThroughputMbps) AS avg_download_speed_mbps,
      AVG(a.MinRTT) AS avg_latency_ms,
      AVG(a.LossRate) AS avg_packet_loss,
      -- Count the number of tests
      COUNT(*) AS num_tests
    FROM
      `measurement-lab.ndt.unified_downloads`
    WHERE
      -- Only include data from the date stored in `latest_download_date`
      date >= "''' || CAST(latest_download_date AS STRING) || '''"
      -- Filter data to only include specific country codes (African countries)
      AND client.Geo.CountryCode IN (
          'DZ', 'AO', 'BJ', 'BW', 'BF', 'BI', 'CV', 'CM', 'CF', 'TD', 'KM', 'CD', 
          'DJ', 'EG', 'GQ', 'ER', 'SZ', 'ET', 'GA', 'GM', 'GH', 'GN', 'GW', 'CI', 
          'KE', 'LS', 'LR', 'LY', 'MG', 'MW', 'ML', 'MR', 'MU', 'MA', 'MZ', 'NA', 
          'NE', 'NG', 'RW', 'ST', 'SN', 'SC', 'SL', 'SO', 'ZA', 'SS', 'SD', 'TZ', 
          'TG', 'TN', 'UG', 'ZM', 'ZW'
      )
      -- Only include records where the best measurement is valid
      AND IsValidBest = TRUE
    GROUP BY
      -- Group the data by year, month, and client characteristics
      year, month, country, region, city, latitude, longitude, as_number, as_name
  ) S
  -- Specify the matching condition for the MERGE operation
  ON T.year = S.year
  AND T.month = S.month
  AND T.country = S.country
  AND T.region = S.region
  AND T.city = S.city
  AND T.latitude = S.latitude
  AND T.longitude = S.longitude
  AND T.as_number = S.as_number
  AND T.as_name = S.as_name
  -- When the data already exists (matched), update the existing record
  WHEN MATCHED THEN
    UPDATE SET
      T.avg_download_speed_mbps = S.avg_download_speed_mbps,
      T.avg_latency_ms = S.avg_latency_ms,
      T.avg_packet_loss = S.avg_packet_loss,
      T.num_tests = S.num_tests
  -- When the data doesn't exist (not matched), insert a new record
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
      avg_download_speed_mbps,
      avg_latency_ms,
      avg_packet_loss,
      num_tests
    )
    -- Specify the values to insert
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
      S.avg_download_speed_mbps,
      S.avg_latency_ms,
      S.avg_packet_loss,
      S.num_tests
    );
''';
