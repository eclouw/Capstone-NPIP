import React, { useEffect, useRef, useState } from "react";
import { TileLayer, MapContainer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import './styles.css';
import "leaflet/dist/leaflet.css"
import axios from "axios";
import getRipeProbes from "../Hooks/getRipeProbes";
import { Icon } from "leaflet";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Card } from "react-bootstrap";


function PageRipeAtlas(){
    const position = [17, 0]
    const [probeMapData, setProbeMapData] = useState([]);
    const [coordinates, setCoordinates] = useState([]);
    const [probeMapDataReady, setProbeMapDataReady] = useState([false])

    useEffect(()=>{
        
        const getProbeMarkers=async()=>{
            const response = await getRipeProbes();
            setProbeMapData(response);
            
        }

        getProbeMarkers();
    },[])

    useEffect(()=>{
        if (probeMapData.length > 0){
            
                setProbeMapDataReady(true);
            }else{
                setProbeMapDataReady(false);
            
        
        }
        console.log(probeMapDataReady);
        console.log(probeMapData);
        
    },[probeMapData])

    const test=(id)=>{
        console.log(id);
    }

    const iconGreen = new Icon({
        iconUrl: "/data/marker-green.png",
        iconSize: [38,38]
    })

    const iconRed = new Icon({
        iconUrl: "/data/marker-red.png",
        iconSize: [38,38]
    })
    return(
        <>
        <div>
            <Container>
            <Row>
                <Col xs={25}>
                <Card>
                    
        <MapContainer center={position} zoom={3} scrollWheelZoom={false}>
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    {probeMapData.length > 0 && probeMapDataReady &&(
        <>
        {probeMapData.map(marker => (
            <MarkerClusterGroup>
                
                {marker.status === 1 ?(
                    <Marker position={[marker.lat, marker.lng]} icon={iconGreen} id={marker.id} eventHandlers={{
                        click: () =>{
                            test(marker.id);
                        },
                    }}>
                        <Popup>
                            <b>Country Code: </b>{marker.countryCode}<br/>
                            <b>Probe ID: </b>{marker.id}<br/>
                            <b>Supports IPv4: </b>{marker.supports_v4.toString()}<br/>
                            <b>Supports IPv6: </b>{marker.supports_v6.toString()}<br/>
                            <b>System Type: </b>{marker.system_type}<br/>
                            </Popup>
                    </Marker>
                ):(
                    <Marker position={[marker.lat, marker.lng]} icon={iconRed} eventHandlers={{
                        click: () =>{
                            test(marker.id);
                        },
                    }}>
                        <Popup>
                            <b>Country Code: </b>{marker.countryCode}<br/>
                            <b>Probe ID: </b>{marker.id}<br/>
                            <b>Supports IPv4: </b>{marker.supports_v4.toString()}<br/>
                            <b>Supports IPv6: </b>{marker.supports_v6.toString()}<br/>
                            <b>System Type: </b>{marker.system_type}<br/>
                            </Popup>
                    </Marker>
                )}
                
                </MarkerClusterGroup>
            
        ))}
        </>
    )}
  </MapContainer>
  
  </Card>
  </Col>
  <Col>
  <Card style={{marginBottom: '20px'}}>
    <Card.Body>
        <Card.Title>
            Ripe Atlas Probe Data
        </Card.Title>
        <Card.Text>
            Here you can select up to two probes to retrieve specific metrics and compare them between the probes. To select a probe, click on a probe so that
            you can see the popup text, then click "Add Probe" below
        </Card.Text>
    </Card.Body>
  </Card>
  <Card style={{marginBottom: '20px'}}>
    <Card.Body>
        <Card.Title>
            Ripe Atlas Probe Data
        </Card.Title>
        <Card.Text>
            Here you can select up to two probes to retrieve specific metrics and compare them between the probes. To select a probe, click on a probe so that
            you can see the popup text, then click "Add Probe" below
        </Card.Text>
    </Card.Body>
  </Card>
  
  </Col>
  </Row>
  </Container>
  </div>
  
        </>
    )
}

export default PageRipeAtlas