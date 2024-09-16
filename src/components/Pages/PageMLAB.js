import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import './styles.css';
import axios from "axios";


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


  //FETCH THE MLAB DATA
  const fetchData = async() => {
    setHaveData(false);
    const response = await axios.post()
  }
  

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
            internalSelectedCountries.splice(index,1)
            setCount((prevCount) => prevCount - 1);
            internalCount = internalCount -1;
            map.current.setFeatureState(
              {source: 'afr-countries', id: hoveredCountryID},
              {clicked: false}
            )
          }else{
            if (internalCount <= maxCompareCountries-1){
              internalSelectedCountries[internalCount] = {id: e.features[0].id, name: e.features[0].properties.name};
              setCount((prevCount) => prevCount + 1);
              internalCount = internalCount +1;
              console.log(count);
              console.log({internalSelectedCountries});
              map.current.setFeatureState(
                {source: 'afr-countries', id: hoveredCountryID},
                {clicked: true}
              )
            }
            
            
          }
          }
          
      })

      map.current.on('mouseenter', 'afr-countries-layer', () => {
        map.current.getCanvas().style.cursor = 'pointer';
      });


    })

    
  }, [count]);



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
                <p>You have selected the following countries:</p>
                <div class="row">
                {internalSelectedCountries.map(internalSelectedCountries => (
                  <div class="col-countries">
                    <h2>{internalSelectedCountries.name}</h2>
                  </div>
                ))}
                </div>
                
                
              </>
              
            )
          }
        </div>
      </div>
      

      


    </div>
  )


}

export default PageMLAB;