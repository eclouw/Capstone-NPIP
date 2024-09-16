import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import './styles.css';
import axios from "axios";

function PageRipeAtlas(){
    //MLAB API KEY
    mapboxgl.accessToken = 'pk.eyJ1IjoiZWxvdXciLCJhIjoiY20xMG5zYXN0MDdhcTJycjVoYXg3Y2VrbCJ9.m9NoEyiaJx-A2AXDHIR6Ew';

    //MAP PARAMETERS
    const map = useRef(null);
    const mapContainer = useRef(null);
    const [count, setCount] = useState(0);
    const [lng, setLng] = useState(20);
    const [lat, setLat] = useState(9);
    const [zoom, setZoom] = useState(2);

    return(
        <>
        </>
    )
}

export default PageRipeAtlas