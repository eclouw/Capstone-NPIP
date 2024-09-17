import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import './styles.css';
import axios from "axios";
import GetMLABData from "../GetMLABData";
import BarChart from "../BarChart";
import LineChart from "../LineChart";
import { Accordion, Dropdown } from "react-bootstrap";

function PageMLAB (){
  //MLAB API KEY
  mapboxgl.accessToken = 'pk.eyJ1IjoiZWxvdXciLCJhIjoiY20xMG5zYXN0MDdhcTJycjVoYXg3Y2VrbCJ9.m9NoEyiaJx-A2AXDHIR6Ew';

  //MAP PARAMETERS
  const map = useRef(null);
  const mapContainer = useRef(null);
  const [count, setCount] = useState(0);
  const [lng, setLng] = useState(20);
  const [lat, setLat] = useState(9);
  const [zoom, setZoom] = useState(2);
  const [internalSelectedCountries, setInternalCountries] = useState([]); //ARRAY FOR STORING SELECTED COUNTRIES
  const [countryDownloadData, setCountryDownloadData] = useState([]);
  const [moveEvent, setMoveEvent] = useState(); 
  let clickedCountryID1 = null;
  let clickedCountryID2 = null;

  //VARIABLES FOR THE ARRAY
  let inArray = false;
  let internalCount = 0;
  let maxCompareCountries = 2;

  //DATA VARIABLES
  const [graphs, setGraphs] = useState([]);
  const [MLABDATA, setMLABDATA] = useState();
  const [haveData, setHaveData] = useState(false);
  const [haveDataCountry1, setHaveDataCountry1] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [timesSeriesDataYear, setTimesSeriesDataYear] = useState([])

  //CHART VARIABLES
  const [latencyOverTimeYear, setLatencyOverTimeYear] = useState([])

  
 
  

  useEffect(() => {

    //CREATE THE MAP IF IT HAS NOT ALREADY BEEN CREATED
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/elouw/cm10xz51301d301pbdw8w8xa7',
      center: [lng, lat],
      zoom: 2,
    });

    let hoveredCountryID = null;
    

    //WHEN THE MAP GETS LOADED
    //ADD THE POLYGON LAYERS WHICH WILL ACT AS AFRICAN COUNTRY SELECTORS
    map.current.on('load', () => {

      //ADD THE SOURCE FOR THE POLYGONS
      map.current.addSource('afr-countries', {
        type: 'geojson',
        data: '/data/africa.geojson',
        generateId: true,
      });

      //ADD THE POLYGON SHAPE LAYER
      map.current.addLayer({
        id: 'afr-countries-layer',
        type: 'fill',
        source: 'afr-countries',
        layout: {},
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['feature-state', 'clicked'], false],
            '#39e75f',
            '#0000FF'
          ],
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            1,
            0.5
          ]
        }
      }, 'water');

      //ADD THE OUTLINES TO THE POLYGON SHAPES LAYER
      map.current.addLayer({
        id: 'afr-countries-outline',
        type: 'line',
        source: 'afr-countries',
        layout: {},
        paint: {
          'line-color': '#000',
          'line-width': 3
        }
      }, 'water');

      //WHEN THE USER HOVERS OVER A COUNTRY SET THE HOVER ID TO THAT COUNTRIES ID
      map.current.on('mousemove', 'afr-countries-layer', (e) => {
        if (e.features.length > 0) {
          if (hoveredCountryID !== null){
            map.current.setFeatureState(
              {source: 'afr-countries', id: hoveredCountryID},
              {hover: false}
            );
          }
          hoveredCountryID = e.features[0].id;
          map.current.setFeatureState(
            {source: 'afr-countries', id: hoveredCountryID},
            {hover: true}
          )
        }
      });

      //WHEN THE USER NO LONGER HOVERS OVER A COUNTRY DESET THE HOVER ID
      map.current.on('mouseleave', 'afr-countries-layer', (e) => {
          map.current.getCanvas().style.cursor = '';
          if (hoveredCountryID !== null){
            map.current.setFeatureState(
              {source: 'afr-countries', id: hoveredCountryID},
              {hover: false}
            );
          }
          hoveredCountryID = null;
      });

      //WHEN THE USER CLICKS ON A COUNTRY, TOGGLE SELECTION IF ENOUGH SPACE IN ARRAY
      map.current.on('click', 'afr-countries-layer', (e) => {
        inArray = false;
        let index = null
        if (e.features.length > 0){
          if (internalSelectedCountries.length > 0){
            for (let i= 0; i < internalSelectedCountries.length; i++){
              if (internalSelectedCountries[i].id == e.features[0].id){
                inArray = true;
                index = i;
              }
              
          }
          
          }else{
            inArray = false;
          }
          if (inArray){
            //remove array data
            internalSelectedCountries.splice(index,1)
            timesSeriesDataYear.splice(index, 1)
            setCount((prevCount) => prevCount - 1);
            internalCount = internalCount -1;
            map.current.setFeatureState(
              {source: 'afr-countries', id: hoveredCountryID},
              {clicked: false}
            )
          }else{
            if (internalCount <= maxCompareCountries-1){
              //add data to arrays
              internalSelectedCountries[internalCount] = {id: e.features[0].id, name: e.features[0].properties.name, code: e.features[0].properties.iso_a2_eh, 
                download: 0, packet_loss: 0, latency: 0, upload: 0, latencyOverTimeYear: [], latencyOverTimeYearReady: false,
              packetLossOverTimeYear: [], packetLossOverTimeYearReady: false, numberOfTestsOverTimeYear: [], numberOfTestsOverTimeYearReady: false,
              uploadSpeedOverTimeYear: [], uploadSpeedOverTimeYearReady: false, downloadSpeedOverTimeYear: [], downloadSpeedOverTimeYearReady: false,
            };
              setCount((prevCount) => prevCount + 1);
              internalCount = internalCount +1;
              map.current.setFeatureState(
                {source: 'afr-countries', id: hoveredCountryID},
                {clicked: true}
                
              )
              countrySelected(internalSelectedCountries[internalCount-1].code);
              ftchTimeSeriesDataYear(internalSelectedCountries[internalCount-1].code);
            }
            
            
          }
          }
          
      })

      map.current.on('mouseenter', 'afr-countries-layer', () => {
        map.current.getCanvas().style.cursor = 'pointer';
      });


    })

    
  }, [internalSelectedCountries]);

  //COMMAND THAT IS RUN INITIALLY WHEN A COUNTRY IS SELECTED TO GET BASIC COUNTRY STATS
  const countrySelected = async(countryCode)=>{
    const result = await fetchCountryData(countryCode, '2024',);
    setHaveData(true);
    setLoadingData(false);
    console.log(result);
  }

   //FETCH THE MLAB DATA WITH A SPECIFIC COMMAND
   const fetchData = async(command) => {
    setLoadingData(true);
    setHaveData(false);
    const response = await axios.post(command);
    return response.data;
  }

  const fetchId=(arr, code)=>{
    var id=-1;
    for (let i =0; i < arr.length;i++){
      if (arr[i].code == code);
      id = i;
    }
    return id;
  }

  //FETCH ALL DATA FOR SPECIFIC COUNTRY
  const fetchCountryData = async(countryCode, year, month) => {
    var id = fetchId(internalSelectedCountries);
    
    if (id != -1){
      if (month == null){
        const avDownload = await fetchData('https://api-mlab-compute-86452853723.us-central1.run.app/?country='+countryCode+'&year='+year+'&metric=avg_combined_speed_mbps&table_type=download&group_by=time_month');
        const avLatency = await fetchData('https://api-mlab-compute-86452853723.us-central1.run.app/?country='+countryCode+'&year='+year+'&metric=avg_latency_ms&table_type=download&group_by=time_month');
        const avPacketLoss = await fetchData('https://api-mlab-compute-86452853723.us-central1.run.app/?country='+countryCode+'&year='+year+'&metric=avg_packet_loss&table_type=download&group_by=time_month');

        const updateCountries = [...internalSelectedCountries];
        updateCountries[id].download = avDownload.data[0].avg_download_speed_mbps;
        updateCountries[id].upload = avDownload.data[0].avg_upload_speed_mbps;
        updateCountries[id].latency = avLatency.data[0].avg_combined_latency_ms;
        updateCountries[id].packet_loss = avPacketLoss.data[0].avg_packet_loss;
        setInternalCountries(updateCountries);
      }else{
        const response = await fetchData('https://api-mlab-compute-86452853723.us-central1.run.app/?country='+countryCode+'&year='+year+'&month='+month+'&metric=avg_download_speed_mbps&metric=avg_packet_loss&table_type=download&group_by=time_year');
        return response;
      }
    }else{
      console.log('oh no')
    }

    
    
  }

  //FETCH TIME SERIES DATA YEAR
  const ftchTimeSeriesDataYear = async(countryCode) =>{
    var id = fetchId(internalSelectedCountries, countryCode);
    if(id != -1){
      internalSelectedCountries[id].latencyOverTimeYearReady = false;
      const avSpeed = await fetchData('https://api-mlab-compute-86452853723.us-central1.run.app/?country='+countryCode+'&metric=avg_combined_speed_mbps&table_type=download&group_by=time_year');
      const avLatency= await fetchData('https://api-mlab-compute-86452853723.us-central1.run.app/?country='+countryCode+'&metric=avg_latency_ms&table_type=download&group_by=time_year');
      const avPacketLoss= await fetchData('https://api-mlab-compute-86452853723.us-central1.run.app/?country='+countryCode+'&metric=avg_packet_loss&table_type=download&group_by=time_year');
      console.log(avSpeed.data);
      
      console.log(avPacketLoss.data);

      avLatency.data.sort((a,b)=>a.year-b.year);
      avSpeed.data.sort((a,b)=>a.year-b.year);
      avPacketLoss.data.sort((a,b)=>a.year-b.year);

      //LATENCY OVER TIME
      let years = avLatency.data.map(item => item.year)
      let data = avLatency.data.map(item => item.avg_combined_latency_ms)
      let updateCountries = [...internalSelectedCountries];
      updateCountries[id].latencyOverTimeYear= await arrayMapper('Latency over time',years, data)
      updateCountries[id].latencyOverTimeYearReady = true;
      setInternalCountries(updateCountries);
      
      //DOWNLOAD SPEED OVER TIME
      years=[];
      years = avSpeed.data.map(item=>item.year)
      data = avSpeed.data.map(item => item.avg_download_speed_mbps)
      updateCountries = [...internalSelectedCountries];
      updateCountries[id].downloadSpeedOverTimeYear= await arrayMapper('Download Speed over time',years, data)
      updateCountries[id].downloadSpeedOverTimeYearReady = true;
      setInternalCountries(updateCountries);

      //UPLOAD SPEED OVER TIME
      years=[];
      years = avSpeed.data.map(item=>item.year)
      data = avSpeed.data.map(item => item.avg_upload_speed_mbps)
      updateCountries = [...internalSelectedCountries];
      updateCountries[id].uploadSpeedOverTimeYear= await arrayMapper('Upload Speed over time',years, data)
      updateCountries[id].uploadSpeedOverTimeYearReady = true;
      setInternalCountries(updateCountries);

      //PACKET LOSS OVER TIME
      years=[];
      years = avPacketLoss.data.map(item=>item.year)
      data = avPacketLoss.data.map(item => item.packet_loss)
      updateCountries = [...internalSelectedCountries];
      updateCountries[id].packetLossOverTimeYear= await arrayMapper('Upload Speed over time',years, data)
      updateCountries[id].packetLossOverTimeYearReady = true;
      setInternalCountries(updateCountries);


      
    }

    //FETCH TIME SERIES DATA MONTH
  const ftchTimeSeriesDataMonth = async(countryCode, year) =>{
    var id = fetchId(internalSelectedCountries, countryCode);
    if(id != -1){
      internalSelectedCountries[id].latencyOverTimeYearReady = false;
      internalSelectedCountries[id].downloadSpeedOverTimeYearReady = false;
      internalSelectedCountries[id].uploadSpeedOverTimeYearReady = false;
      internalSelectedCountries[id].packetLossOverTimeYearReady = false;
      const avSpeed = await fetchData('https://api-mlab-compute-86452853723.us-central1.run.app/?country='+countryCode+'&year='+year+'&metric=avg_combined_speed_mbps&table_type=download&group_by=time_year');
      const avLatency= await fetchData('https://api-mlab-compute-86452853723.us-central1.run.app/?country='+countryCode+'&year='+year+'&metric=avg_latency_ms&table_type=download&group_by=time_year');
      const avPacketLoss= await fetchData('https://api-mlab-compute-86452853723.us-central1.run.app/?country='+countryCode+'&year='+year+'&metric=avg_packet_loss&table_type=download&group_by=time_year');
      console.log(avSpeed.data);
      
      console.log(avPacketLoss.data);

      avLatency.data.sort((a,b)=>a.year-b.year);
      avSpeed.data.sort((a,b)=>a.year-b.year);
      avPacketLoss.data.sort((a,b)=>a.year-b.year);

      //LATENCY OVER TIME
      let years = avLatency.data.map(item => item.year)
      let data = avLatency.data.map(item => item.avg_combined_latency_ms)
      let updateCountries = [...internalSelectedCountries];
      updateCountries[id].latencyOverTimeYear= await arrayMapper('Latency over time',years, data)
      updateCountries[id].latencyOverTimeYearReady = true;
      setInternalCountries(updateCountries);
      
      //DOWNLOAD SPEED OVER TIME
      years=[];
      years = avSpeed.data.map(item=>item.year)
      data = avSpeed.data.map(item => item.avg_download_speed_mbps)
      updateCountries = [...internalSelectedCountries];
      updateCountries[id].downloadSpeedOverTimeYear= await arrayMapper('Download Speed over time',years, data)
      updateCountries[id].downloadSpeedOverTimeYearReady = true;
      setInternalCountries(updateCountries);

      //UPLOAD SPEED OVER TIME
      years=[];
      years = avSpeed.data.map(item=>item.year)
      data = avSpeed.data.map(item => item.avg_upload_speed_mbps)
      updateCountries = [...internalSelectedCountries];
      updateCountries[id].uploadSpeedOverTimeYear= await arrayMapper('Upload Speed over time',years, data)
      updateCountries[id].uploadSpeedOverTimeYearReady = true;
      setInternalCountries(updateCountries);

      //PACKET LOSS OVER TIME
      years=[];
      years = avPacketLoss.data.map(item=>item.year)
      data = avPacketLoss.data.map(item => item.packet_loss)
      updateCountries = [...internalSelectedCountries];
      updateCountries[id].packetLossOverTimeYear= await arrayMapper('Upload Speed over time',years, data)
      updateCountries[id].packetLossOverTimeYearReady = true;
      setInternalCountries(updateCountries);


      
    }
  }

    

  

  

  
}

//MAP AN ARRAY TO THE CORRECT FORMAT FOR GRAPHS
const arrayMapper=async(labelText, labelData,dataSetData)=>{
  const data={
    labels:labelData,
    datasets:[{
      label: labelText,
      data: dataSetData,
      backgroundColor: ["#134074"],
      fill:false,
      borderColor: "black",
      borderWidth: 2,
    }]
  }
  console.log('mapped array')
  return data;

}

const handleSelect = (eventKey) =>{
  console.log(eventKey)
}

  

  

  //THE HTML FOR THE PAGE
  return(

    <div className="PageMLAB">
      <h1>MLAB COUNTRY DATA</h1>
      <div class="row">
        <div class="col">
          <div className="map-data-container">
            <div className="map-container" >
              <div ref={mapContainer}></div>
            </div>
          </div>
        </div>
        <div class="col">
          <h1>Selected Countries</h1>
          {
            count == 0 &&(
              <p>You have not selected any countries. Click on a maximum of two countries on the map to the left to select countries.</p>
              
            )
          }
          {
            count > 0 &&(
              <>
                <p>Below is data for the current year for the selected countries</p>
                <div class="row">
                {internalSelectedCountries.map(internalSelectedCountries => (
                  <div class="col-countries" >
                    <h2>{internalSelectedCountries.name}</h2>
                    
                      <>
                      {internalSelectedCountries.download === 0 &&(
                        <p>Loading Data</p>
                      )}
                      {internalSelectedCountries.download !== 0 &&(
                        <>
                        <ul>
                        <li><b>Average download speed:</b> {(internalSelectedCountries.download).toFixed(2)} Mbps</li>
                        <li><b>Average upload speed:</b> {(internalSelectedCountries.upload).toFixed(2)} Mbps</li>
                        <li><b>Average latency:</b> {(internalSelectedCountries.latency).toFixed(2)} ms</li>
                        <li><b>Average packet loss:</b> {((internalSelectedCountries.packet_loss)*100).toFixed(2)}%</li>
                      </ul>
                      </>
                      )}
                      
                      </>
                      
                    
                  </div>
                ))}
                </div>
                
                
                
              </>
              
            )
          }
        </div>
      </div>
      <div>
      <Accordion>
        <Accordion.Item eventKey="0">
          <Accordion.Header><h2>Time Series Data (Yearly)</h2></Accordion.Header>
          <Accordion.Body>
        {internalSelectedCountries[0] != null && internalSelectedCountries[0].latencyOverTimeYearReady === true &&(
          <>
            <div class = "row">
            {internalSelectedCountries.map(internalSelectedCountries => (
            <div class = "col" key={internalSelectedCountries.id}>
              <h2>Latency over time</h2>
              {internalSelectedCountries.latencyOverTimeYearReady === true &&(
                <>
                  <p>{internalSelectedCountries.name}</p>
                  
                  <div class='graph'><LineChart chartData={internalSelectedCountries.latencyOverTimeYear}/></div>
                </>
                
              )}
              <h2>Download Speed over time</h2>
              {internalSelectedCountries.downloadSpeedOverTimeYearReady === true &&(
                <>
                  <p>{internalSelectedCountries.name}</p>
                  
                  <div class='graph'><LineChart chartData={internalSelectedCountries.downloadSpeedOverTimeYear}/></div>
                </>
                
              )}
              <h2>Upload Speed over time</h2>
              {internalSelectedCountries.uploadSpeedOverTimeYearReady === true &&(
                <>
                  <p>{internalSelectedCountries.name}</p>
                  
                  <div class='graph'><LineChart chartData={internalSelectedCountries.uploadSpeedOverTimeYear}/></div>
                </>
                
              )}
              
            </div>
          ))}
        </div>
          </>
        )}
        </Accordion.Body>
      </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header><h2>Time Series Data (Monthly)</h2></Accordion.Header>
            <Accordion.Body>
              {internalSelectedCountries[0] != null && internalSelectedCountries[0].latencyOverTimeYearReady === true &&(
                <>
                  <div class = "row">
                              <Dropdown onSelect={handleSelect()}>
                                <Dropdown.Toggle variant="primary" id={internalSelectedCountries.id}>
                                  Select a year
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item eventKey="tsd2020">2020</Dropdown.Item>
                                  <Dropdown.Item eventKey="tsd2021">2021</Dropdown.Item> 
                                  <Dropdown.Item eventKey="tsd2022">2022</Dropdown.Item>
                                  <Dropdown.Item eventKey="tsd2023">2023</Dropdown.Item>
                                  <Dropdown.Item eventKey="tsd2024">2024</Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            
                    {internalSelectedCountries.map(internalSelectedCountries => (
                      <>
                        <div class = "col" key={internalSelectedCountries.id}>
                          {internalSelectedCountries.latencyOverTimeYearReady === true &&(
                            <>
                            </>
                              
                          )}
                        </div>
                      </>
                    ))}
                  </div>
                </>
              )}
            </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      </div>
      
      

      


    </div>
  )


}

export default PageMLAB;