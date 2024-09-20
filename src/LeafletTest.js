import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css"
import "./components/Pages/styles.css"
import axios from "axios";
import { useState } from "react";
import setGlobals from "react-map-gl/dist/esm/utils/set-globals";
import Button from "./components/Button.tsx";
import LineChart from './components/LineChart.js';

export default function LeafletTest() {
    const[testingData, setTestingData] = useState([])
    const[LoadindData, setLoadingData] = useState(false)
    const[haveData, setHaveData] = useState(false)

    const fetchData = async () => {
        try{
          setLoadingData(true)
          setHaveData(false)
          const response = await axios.post("https://get-probes-86452853723.us-central1.run.app/?country_code=ZA&prefix_type=v4")
          
          //Set the LatencyData to the data that was retrieved from MLab
          setTestingData({
            labels: response.data.data.map((data) => data.country),
            datasets: [{
              label: "Mean Upload Speed",
              data: response.data.data.map((data) => data.avg_upload_speed_mbps),
              backgroundColor: ["#32CD32"],
              borderColor: "black",
              borderWidth: 2,
            }]
          });
          const response1 = await axios.post("https://get-probes-86452853723.us-central1.run.app/?is_anchor=true&status_since=1685444191") //attempt to get response from backend
          
          //Set the LatencyData to the data that was retrieved from MLab
          setTestingData({
            labels: response1.data.data.map((data) => data.country),
            datasets: [{
              label: "Mean Upload Speed",
              data: response1.data.data.map((data) => data.avg_latency_ms),
              backgroundColor: ["#32CD32"],
              borderColor: "black",
              borderWidth: 2,
            }]
          });
          const response2 = await axios.post("https://get-measurements-86452853723.us-central1.run.app/?probe_id=1000237&year=2023")
          
          //Set the LatencyData to the data that was retrieved from MLab
          setTestingData({
            labels: response2.data.data.map((data) => data.country),
            datasets: [{
              label: "Mean Upload Speed",
              data: response2.data.data.map((data) => data.avg_upload_speed_mbps),
              backgroundColor: ["#32CD32"],
              borderColor: "black",
              borderWidth: 2,
            }]
          });
          
          
          
          setLoadingData(false);
          setHaveData(true);
          
        } catch(e){
          
        }
      }

    return (
        <>
        <MapContainer center={[0, 17]} zoom={2}>
            <TileLayer
                url="https://api.mapbox.com/styles/v1/elouw/cm10xz51301d301pbdw8w8xa7/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZWxvdXciLCJhIjoiY20xMG5zYXN0MDdhcTJycjVoYXg3Y2VrbCJ9.m9NoEyiaJx-A2AXDHIR6Ew"
                attribution="© <a href='org/copyright'>OpenStreetMap</a> <strong><a href='        </MapContainer><div style={{margin:20}}><Button buttonType = 'btn btn-primary' onClick={fetchData}>Load The Data</Button></div>"
            />
            <Marker position={[0,17]}/>
        </MapContainer>
        <div style={{margin:20}}><Button buttonType = 'btn btn-primary' onClick={fetchData}>Load Data</Button></div>
        {haveData && !LoadindData && (
            <>
            <p>Data is here!</p>
            <div class="RipeChart"><LineChart chartData={testingData}/></div>
            </>
        )}
        {LoadindData && (
            <p>Loading Data</p>
        )}
        </>
        
    )

}
//mapbox://styles/elouw/cm10xz51301d301pbdw8w8xa7
