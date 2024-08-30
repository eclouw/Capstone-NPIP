
import './App.css';
import BarChart from './components/BarChart';
import React, { useEffect, useState, onChange } from "react";
import Chart from 'chart.js/auto';
import LineChart from './components/LineChart.js';
import PieChart from './components/PieChart.js';
import NavBar  from './components/NavBar.js';
import Button from './components/Button.tsx';
import InputField from './components/InputField.tsx';
import GMap from './components/GMap.js'
import axios from 'axios';
import { MAP_PANE } from '@react-google-maps/api';




function App() {
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
        const response = await axios.post('http://localhost:5000/dataset/mean/'+country1Input+'/'+country2Input) //attempt to get response from backend
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
      const response = await axios.post('http://localhost:5000/dataset/ripe')
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
      const response = await axios.post('http://localhost:5000/dataset/raw/'+country1Input)
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
      const response = await axios.post('http://localhost:5000/dataset/raw/'+country2Input)
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
    <div>
    <NavBar/> 
    </div>
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

    
    <div class="map-container">
      <GMap/>
    </div>
    
  </div>
  )
}

export default App;
