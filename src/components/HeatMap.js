import mapboxgl from "mapbox-gl";
import React, { ReactNode, useEffect, useRef } from "react";
import { Component } from "react";
import './Pages/styles.css'

// //Parameters
// interface Props{
//     dataSet: [],
//     key: String,
//     latKey: String,
//     lngKey: String
// }

class HeatMap extends Component{
    componentDidMount(){
      const {dataset, key, latKey, lngKey} = this.props;

    
    mapboxgl.accessToken = 'pk.eyJ1IjoiZWxvdXciLCJhIjoiY20xMG5zYXN0MDdhcTJycjVoYXg3Y2VrbCJ9.m9NoEyiaJx-A2AXDHIR6Ew';

    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/elouw/cm16f1zn801zd01o3hiikhhwt',
      center: [20,9],
        zoom:2
    });

    this.map.addSource('heat-source', {
      type: 'geojson',
      data:{
        type: 'FeatureCollection',
        features: dataset.map(key =>{
          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [dataset.lng, dataset.lat]
            },
            properties: {
              value: key
            }
          }
        })
      }
    });

    this.map.addLayer({
      id: 'heat-layer',
      type: 'heatmap',
      source:'heat-source',
      maxzoom:9,
      paint:{
        'heatmap-weight': [
          'interpolate',
          ['linear'],
          ['get', 'value'],
          0,
          0,
          6,
          1
        ],
        'heatmap-intensity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0,
          1,
          9,
          3
        ],
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0,
          'rgba(33,102,172,0)',
          0.2,
          'rgb(103,169,207)',
          0.4,
          'rgb(209, 229, 240)',
          0.8,
          'rgb(239,138,98)',
          1,
          'rgb(178,24,43)'
        ],
        'heatmap-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0,
          2,
          9,
          20
        ]
      }
    }, 'water')

    
  }
  render() {
    return <div id="map" />;
  }
}

export default HeatMap;