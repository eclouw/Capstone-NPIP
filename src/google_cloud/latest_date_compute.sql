-- Update the utils table with the latest download and upload dates
UPDATE project-npip.Utils.Mlab_dates
SET 
    -- Latest date for download speed
    latest_download_date = (
        SELECT MAX(DATE(CONCAT(CAST(year AS STRING), '-', LPAD(CAST(month AS STRING), 2, '0'), '-01')))
        FROM project-npip.MeasurementLab.download
    ),
    
    -- Latest date for upload speed
    latest_upload_date = (
        SELECT MAX(DATE(CONCAT(CAST(year AS STRING), '-', LPAD(CAST(month AS STRING), 2, '0'), '-01')))
        FROM project-npip.MeasurementLab.upload
    )
WHERE true;
