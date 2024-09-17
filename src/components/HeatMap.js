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
      const {dataset, containerID} = this.props;
      let sourceKey=0
    
    mapboxgl.accessToken = 'pk.eyJ1IjoiZWxvdXciLCJhIjoiY20xMG5zYXN0MDdhcTJycjVoYXg3Y2VrbCJ9.m9NoEyiaJx-A2AXDHIR6Ew';
    console.log(containerID);
    this.map = new mapboxgl.Map({
      container: containerID,
      style: 'mapbox://styles/elouw/cm16f1zn801zd01o3hiikhhwt',
      center: [20,9],
        zoom:2
    });

    for (let i=0; i< dataset.length;i++){
      sourceKey=sourceKey+dataset[i].value
    }

    this.map.on('load', async()=>{
      if (!this.map.getSource('heat-source'))
      this.map.addSource('heat-source', {
        type: 'geojson',
        data:{
          type: 'FeatureCollection',
          features: dataset.map(item =>{
            return {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [item.lng, item.lat]
              },
              properties: {
                'value': item.key
              }
            }
          })
        }
      });

      console.log(
        {
          type: 'geojson',
          data:{
            type: 'FeatureCollection',
            features: dataset.map(item =>{
              return {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [item.lng, item.lat]
                },
                properties: {
                  'value': item.key
                }
              }
            })
          }
        }
      )
      if (!this.map.getLayer('heat-layer'))
      this.map.addLayer({
        id: 'heat-layer',
        type: 'heatmap',
        source:'heat-source',
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
    })
    

    
  }
  render() {
    return <div id="map" />;
  }
}

export default HeatMap;