from flask import Flask, request, jsonify, send_from_directory
import os
from google.cloud import bigquery
import pandas as pd
from flask_cors import CORS
from ripe.atlas.sagan import PingResult



app = Flask(__name__)
CORS(app, origins=['http://localhost:3000'])

@app.route("/dataset/filter/<countryCode1>/<countryCode2>", methods=['GET', 'POST'])
def getDataFiltered(countryCode1, countryCode2):
    if ((countryCode1 == '') or (countryCode2 == '')):
        getDefaultMLabData()
    else:
        countryCode1.strip()
        countryCode2.strip()
        return getMLabData(countryCode1, countryCode2)
    
#Get the default data set, which is South Africa and Kenya
@app.route("/dataset", methods=['GET', 'POST'])
def getDefaultMLabData():
    return getMLabData("South Africa", "Kenya") #get default dataset of south africa and kenya if no specific filter
    

#Get MLab mean data for specifid countries
@app.route("/dataset/mean/<countryCode1>/<countryCode2>", methods=['GET', 'POST'])
def getMeanLab(countryCode1, countryCode2):
    result_dataframe_MLAB= getMLabData(countryCode1, countryCode2)
    mean_mlab = result_dataframe_MLAB.groupby(['ClientCountry']).mean()
    mean_mlab = mean_mlab.reset_index()
    return (mean_mlab.to_json(orient='records'))

@app.route("/dataset/raw/<countryCode>", methods=['GET', 'POST'])
def getRawMLab(countryCode):
    result_dataframe_MLAB= getMLabDataOnce(countryCode)
    return (result_dataframe_MLAB.to_json(orient='records'))


#Get data from MLab for specified countries
def getMLabData(country1, country2):
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'avian-buffer-431609-f7-13ef164881ad.json'

    storage_client = bigquery.Client()

    sql_query_MLAB = ("""SELECT ClientCountry, Latency, Throughput, TimeStamp, PacketLoss FROM npip_capstone.DataMeasurementLab WHERE ClientCountry IN ('%s', '%s') """ % (country1, country2))

    query_job_MLAB = storage_client.query(sql_query_MLAB)
    result_MLAB = query_job_MLAB.result()

    result_dataframe_MLAB = result_MLAB.to_dataframe()

    #files not actually needed
    #result_dataframe_MLAB.to_json('requestedMetricsMLAB.json', orient = 'records', lines = True) 
    return result_dataframe_MLAB
    

#Get MLabData for one country
def getMLabDataOnce(country):
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'avian-buffer-431609-f7-13ef164881ad.json'

    storage_client = bigquery.Client()

    sql_query_MLAB = ("""SELECT ClientCountry, Latency, Throughput, TimeStamp, PacketLoss FROM npip_capstone.DataMeasurementLab WHERE ClientCountry IN ('%s') """ % (country))

    query_job_MLAB = storage_client.query(sql_query_MLAB)
    result_MLAB = query_job_MLAB.result()

    result_dataframe_MLAB = result_MLAB.to_dataframe()
    return result_dataframe_MLAB
    
    
#Get data from RipeAtlas
@app.route("/dataset/ripe", methods=['GET', 'POST'])
def getRipeData():
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'avian-buffer-431609-f7-13ef164881ad.json'

    storage_client = bigquery.Client()

    sql_query_Ripe = """

    SELECT rtt_average, rtt_min, rtt_max
    FROM npip_capstone.DataRipeAtlas 

    """

    query_job_Ripe = storage_client.query(sql_query_Ripe)
    result_Ripe = query_job_Ripe.result()

    result_dataframe_Ripe = result_Ripe.to_dataframe()
    #files not actually needed
    #result_dataframe_Ripe.to_json('requestedMetricsRipe.json', orient = 'records', lines = True)

    return (result_dataframe_Ripe.to_json(orient="records"))
    





if __name__ == '__main__':
    app.run(debug=True)