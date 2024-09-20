MERGE `project-npip.RipeAtlas.probes` T
USING (
  -- Get the latest row for each `id` in the staging table
  SELECT
    id,
    country_code,
    is_anchor,
    supports_v4,
    supports_v6,
    status_id,
    status_since,
    system_type,
    lat,
    lng
  FROM (
    -- Select all columns from the staging table and assign a row number 
    -- to each row partitioned by `id`, ordered by `status_since` in descending order
    SELECT *,
      ROW_NUMBER() OVER (PARTITION BY id ORDER BY status_since DESC) AS row_num
    FROM `project-npip.RipeAtlas.probes_staging`
  )
  -- Filter to keep only the latest row for each `id` (where row_num = 1)
  WHERE row_num = 1
) S
-- Perform a merge operation by joining the target table `T` with the result `S`
ON T.id = S.id
WHEN MATCHED THEN
  -- If a match is found, update the target table with the values from the source table
  UPDATE SET
    T.country_code = S.country_code,
    T.is_anchor = S.is_anchor,
    T.supports_v4 = S.supports_v4,
    T.supports_v6 = S.supports_v6,
    T.status_id = S.status_id,
    T.status_since = S.status_since,
    T.system_type = S.system_type,
    T.lat = S.lat,
    T.lng = S.lng
WHEN NOT MATCHED THEN
  -- If no match is found, insert the new record into the target table
  INSERT (
    id,
    country_code,
    is_anchor,
    supports_v4,
    supports_v6,
    status_id,
    status_since,
    system_type,
    lat,
    lng
  )
  VALUES (
    S.id,
    S.country_code,
    S.is_anchor,
    S.supports_v4,
    S.supports_v6,
    S.status_id,
    S.status_since,
    S.system_type,
    S.lat,
    S.lng
  );
