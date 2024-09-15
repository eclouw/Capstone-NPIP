
import './App.css';
import BarChart from './components/BarChart.js';
import React, { useEffect, useState, useRef } from "react";
import Chart from 'chart.js/auto';
import LineChart from './components/LineChart.js';
import PieChart from './components/PieChart.js';
import NavBar  from './components/NavBar.js';
import Button from './components/Button.tsx';
import InputField from './components/InputField.tsx';
import GMap from './components/GMap.tsx'
import axios from 'axios';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import geoJsonAfricaStorage from './components/geoJsonAfricaStorage.js';




function App() {
  const afrdata = {geoJsonAfricaStorage}
  console.log({afrdata})
  //MAPBOX STUFF
  mapboxgl.accessToken = 'pk.eyJ1IjoiZWxvdXciLCJhIjoiY20xMG5zYXN0MDdhcTJycjVoYXg3Y2VrbCJ9.m9NoEyiaJx-A2AXDHIR6Ew';
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(0);
  const [lat, setLat] = useState(17);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    
    
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/elouw/cm10xz51301d301pbdw8w8xa7',
      center: [lng, lat],
      zoom: zoom
    });

    let hoveredPolygonId = null;

    map.current.on('load', () => {
      map.current.addSource('countries', {
        type: 'geojson',
        data: './Data/africa.geojson'
      });

      map.current.addSource('points', {
        type: 'geojson',
        data: '/data/test.geojson'
      });

      map.current.addLayer({
        id: 'testPoints',
        type: 'circle',
        source:'points',
        paint: {
          'circle-radius': 6,
          'circle-color': '#B42222'
        }
      })

      map.current.addSource('maine', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            // These coordinates outline Maine.
            coordinates: [
              [
                [-67.13734, 45.13745],
                [-66.96466, 44.8097],
                [-68.03252, 44.3252],
                [-69.06, 43.98],
                [-70.11617, 43.68405],
                [-70.64573, 43.09008],
                [-70.75102, 43.08003],
                [-70.79761, 43.21973],
                [-70.98176, 43.36789],
                [-70.94416, 43.46633],
                [-71.08482, 45.30524],
                [-70.66002, 45.46022],
                [-70.30495, 45.91479],
                [-70.00014, 46.69317],
                [-69.23708, 47.44777],
                [-68.90478, 47.18479],
                [-68.2343, 47.35462],
                [-67.79035, 47.06624],
                [-67.79141, 45.70258],
                [-67.13734, 45.13745]
              ]
            ]
          }
        }
      });

      map.current.addLayer({
        id: 'maine',
        type: 'fill',
        source: 'maine',
        layout: {},
        paint: {
          'fill-color': '#0080ff',
          'fill-opacity': 0.5
        }
      });

      map.current.addLayer({
        id: 'countries-layer',
        type: 'fill',
        source: 'countries',
        layout: {},
        paint: {
          'fill-color': '#0080ff',
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            1,
            0.5
          ]
        }
      }, 'water');

      map.current.addLayer({
        id: 'countires-outline',
        type: 'line',
        source: 'countries',
        layout: {},
        paint: {
          'line-color': '#000',
          'line-width': 3
        }
      }, 'water');

      map.current.addLayer({
        id: 'outline',
        type: 'line',
        source: 'maine',
        layout: {},
        paint: {
          'line-color': '#000',
          'line-width': 3
        }
      });

      map.current.on('mousemove', 'countries-layer', (e) => {
        if (e.features.length > 0){
          if (hoveredPolygonId !== null){
            map.current.setFeatureState(
              {source: 'countries', id: hoveredPolygonId},
              {hover: false}
            )
          }
          hoveredPolygonId = e.features[0].id;
          map.current.setFeatureState(
            {source: 'countries', id: hoveredPolygonId},
            {hover: true}
          )

        }
      })
    })
  }, [])
  
  
  //MLAB DATA
  const[LatencyData, setLatencyData] = useState([])
  const[LoadindData, setLoadingData] = useState(false)
  const[packetLossData, setPacketLossData] = useState([])
  const[ThroughputDataMLab, setMThroughput] = useState([])
  //MLAB DATA FOR SINGULAR COUNTRIES
  const[Country1LatencyTime, setCountry1LatencyTime] = useState([])
  const[Country2LatencyTime, setCountry2LatencyTime] = useState([])
  const[Country1PacketLost, setCountry1PacketLossTime] = useState([])
  const[Country2PacketLost, setCountry2PacketLossTime] = useState([])
  const[country1ThroughputTime, setCountry1ThroughputTime] = useState([])
  const[country2ThroughputTime, setCountry2ThroughputTime] = useState([])

  //RIPE ATLAS DATA
  const[RTTAverage, setRTTAverage] = useState([])
  const[RTTMin, setRTTMin] = useState([])
  const[RTTMax, setRTTMax] = useState([])

  const[haveData, setHaveData] = useState(false)

  const [country1Input, setCountry1Input] = useState('')
  const [country2Input, setCountry2Input] = useState('')

  const setCountry1 = (event) => {
    setCountry1Input(event.target.value)
    
  }

  const setCountry2 = (event) => {
    setCountry2Input(event.target.value)
    
  }


  const fetchData = async () => {
      try{
        setLoadingData(true)
        setHaveData(false)
        const response = await axios.post('http://127.0.0.1:5000/dataset/mean/'+country1Input+'/'+country2Input) //attempt to get response from backend
        //Set the LatencyData to the data that was retrieved from MLab
        setLatencyData({
          labels: response.data.map((data) => data.ClientCountry),
          datasets: [{
            label: "Mean latency",
            data: response.data.map((data) => data.Latency),
            backgroundColor: ["#32CD32"],
            borderColor: "black",
            borderWidth: 2,
          }]
        });
        //Set the througput data to the data that was retrieved from MLab
        setMThroughput({
          labels: response.data.map((data) => data.ClientCountry),
          datasets: [{
            label: "Mean Throughput",
            data: response.data.map((data) => data.Throughput),
            backgroundColor: ["#32CD32"],
            borderColor: "black",
            borderWidth: 2,
          }]
        });
        //Set the packet loss data to the data that was retrieved from MLab
        setPacketLossData({
          labels: response.data.map((data) => data.ClientCountry),
          datasets: [{
            label: "Mean Packet Loss",
            data: response.data.map((data) => data.PacketLoss),
            backgroundColor: ["#32CD32"],
            borderColor: "black",
            borderWidth: 2,
          }]
        });
        console.log("Fetched mean data")
        fetchRipeData()
      } catch(e){
        console.log(e);
      }
    }

    //retrieve data from RipeAtlas
    const fetchRipeData = async () => {
      const response = await axios.post('http://127.0.0.1:5000/dataset/ripe')
      setRTTAverage({
        labels: response.data.map((_, index) => index + 1),
        datasets: [{
          label: "RTT average values",
          data: response.data.map((data) => data.rtt_average),
          backgroundColor: ["#32CD32"],
          borderColor: "black",
          borderWidth: 2,
        }]
      });

      setRTTMin({
        labels: response.data.map((_, index) => index + 1),
        datasets: [{
          label: "RTT Min values",
          data: response.data.map((data) => data.rtt_min),
          backgroundColor: ["#32CD32"],
          borderColor: "black",
          borderWidth: 2,
        }]
      });

      setRTTMax({
        labels: response.data.map((_, index) => index + 1),
        datasets: [{
          label: "RTT Max values",
          data: response.data.map((data) => data.rtt_max),
          backgroundColor: ["#32CD32"],
          borderColor: "black",
          borderWidth: 2,
        }]
      });
      
      console.log("Fetched ripe data")
      await fetchTimeDataCountry1()
      await fetchTimeDataCountry2()

      setLoadingData(false)
      //Set have data to enable the graphs on the ui
      setHaveData(true)
      
      
    }

    const fetchTimeDataCountry1 = async () => {
      const response = await axios.post('http://127.0.0.1:5000/dataset/raw/'+country1Input)
      setCountry1LatencyTime({
        labels: response.data.map((data) => data.TimeStamp),
        datasets: [{
          label: "Latency over time",
          data: response.data.map((data) => data.Latency),
          backgroundColor: ["#32CD32"],
          borderColor: "black",
          borderWidth: 2,
        }]
      });

      setCountry1PacketLossTime({
        labels: response.data.map((data) => data.TimeStamp),
        datasets: [{
          label: "Packet loss over time",
          data: response.data.map((data) => data.PacketLoss),
          backgroundColor: ["#32CD32"],
          borderColor: "black",
          borderWidth: 2,
        }]
      });

      setCountry1ThroughputTime({
        labels: response.data.map((data) => data.TimeStamp),
        datasets: [{
          label: "Throughput over time",
          data: response.data.map((data) => data.Throughput),
          backgroundColor: ["#32CD32"],
          borderColor: "black",
          borderWidth: 2,
        }]
      });
      console.log("Fetched country 1 data")
      
    }

    const fetchTimeDataCountry2 = async () => {
      const response = await axios.post('http://127.0.0.1:5000/dataset/raw/'+country2Input)
      setCountry2LatencyTime({
        labels: response.data.map((data) => data.TimeStamp),
        datasets: [{
          label: "Latency over time",
          data: response.data.map((data) => data.Latency),
          backgroundColor: ["#32CD32"],
          borderColor: "black",
          borderWidth: 2,
        }]
      });

      setCountry2PacketLossTime({
        labels: response.data.map((data) => data.TimeStamp),
        datasets: [{
          label: "Packet loss over time",
          data: response.data.map((data) => data.PacketLoss),
          backgroundColor: ["#32CD32"],
          borderColor: "black",
          borderWidth: 2,
        }]
      });

      setCountry2ThroughputTime({
        labels: response.data.map((data) => data.TimeStamp),
        datasets: [{
          label: "Throughput over time",
          data: response.data.map((data) => data.Throughput),
          backgroundColor: ["#32CD32"],
          borderColor: "black",
          borderWidth: 2,
        }]
      });

      console.log("fetched country 2 data")

      

      
    }

    
    


  //The HTML elemts to display
  return (<div className='App'>
    
    <div style={{margin:20}}><input type={Text} name="country1" labelText='Country 1' value={country1Input} onChange={setCountry1}/></div>
    <div style={{margin:20}}><input type={Text} name="country2" labelText='Country 2' value={country2Input} onChange={setCountry2}/></div>
    <div style={{margin:20}}><Button buttonType = 'btn btn-primary' onClick={fetchData}>
      {LoadindData && (
        <>Loading Data</>
      )}
      {!LoadindData && (
        <>Load Data</>
      )}
    </Button></div>
    
    <div>
      {LoadindData && (
        <><div class="d-flex justify-content-center">
        <div class="spinner-border" role="status">
        </div>
      </div>
        </>
      )}
    </div>
    {haveData && !LoadindData &&(
      <>
      <h1>MLab Data</h1>
      <h2>Mean Graphs</h2>
      <div class="GraphCollection">
        <div class="Graph"><BarChart chartData={LatencyData}/></div>
      
        <div class="Graph"><BarChart chartData={ThroughputDataMLab}/></div>
        
        <div class="Graph"><BarChart chartData={packetLossData}/></div>
        
        </div>
        <div class="GraphCollection">
        <div class = "GraphCompare">
          <h2>{country1Input}</h2>
          <LineChart chartData={Country1PacketLost}/>
          </div>
          <div class = "GraphCompare">
          <h2>{country2Input}</h2>
          <LineChart chartData={Country2PacketLost}/>
          </div>
        </div>

        <div class = "GraphCollection">
          <div class="GraphCompare">
          <LineChart chartData={Country1LatencyTime}/>
          </div>
          <div class = "GraphCompare">
          <LineChart chartData={Country2LatencyTime}/>
          </div>
        </div>

        <div class = "GraphCollection">
          <div class="GraphCompare">
          <LineChart chartData={country1ThroughputTime}/>
          </div>
          <div class = "GraphCompare">
          <LineChart chartData={country2ThroughputTime}/>
          </div>
        </div>

        <div class="CenterItems">
          <h1>Ripe Atlas Data</h1>
          <div class="RipeChart"><LineChart chartData={RTTAverage}/></div>
      
          <div class="RipeChart"><LineChart chartData={RTTMin}/></div>
        
          <div class="RipeChart"><LineChart chartData={RTTMax}/></div>
        
        </div>
        
          </>
    )}
    
    <div ref={mapContainer} className="map-container" />
    
  </div>
  )
}

export default App;

//AfricaOnly2D
//mapbox://styles/elouw/cm10xz51301d301pbdw8w8xa7

//AfricaOnly3D
//mapbox://styles/elouw/cm10zjo4a018v01pj2nyf68a6