import React, { useEffect, useRef, useState } from "react";
import { TileLayer, MapContainer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css"
import axios from "axios";
import getRipeProbes from "../Hooks/getRipeProbes";
import { Icon } from "leaflet";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Card, Button, ListGroup, CloseButton } from "react-bootstrap";


function PageRipeAtlas(){
    const position = [17, 0]
    const [probeMapData, setProbeMapData] = useState([]);
    const [coordinates, setCoordinates] = useState([]);
    const [probeMapDataReady, setProbeMapDataReady] = useState([false])
    const [selectedProbes, setSelectedProbes] = useState([]);

    useEffect(()=>{
        
        const getProbeMarkers=async()=>{
            const response = await getRipeProbes();
            setProbeMapData(response);
            
        }

        getProbeMarkers();
    },[])

    const addSelectedProbe=(id)=>{
        const index = selectedProbes.findIndex(item=>item.id === id);
        if (index !==-1){
            console.log('Already selected')
        }else{
            let data = ([]);
            data.push({id: id});
            setSelectedProbes((currentSelectedProbes)=>([...currentSelectedProbes, ...data]));
        }
        

    }

    const removeProbe = (removeID)=>{
        const index = selectedProbes.findIndex(item => item.id === removeID);
        if (index !== -1){
            const data = [...selectedProbes.slice(0, index), ...selectedProbes.slice(index+1)];
            setSelectedProbes(data);
        }
    }

    useEffect(()=>{
        if (probeMapData.length > 0){
            
                setProbeMapDataReady(true);
            }else{
                setProbeMapDataReady(false);
            
        
        }
        console.log(probeMapDataReady);
        console.log(probeMapData);
        
    },[probeMapData], [selectedProbes])

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
                <Col xs={25} style={{marginTop:'20px' }}>
                <Card >
                    
        <MapContainer center={position} zoom={3} scrollWheelZoom={true} >
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
                            <p><Button variant="success" onClick={()=>{addSelectedProbe(marker.id)}}>Add Probe</Button></p>
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
                            <p><Button variant="success" onClick={()=>{addSelectedProbe(marker.id)}}>Add Probe</Button></p>

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
            <h3>Ripe Atlas Probe Data</h3>
        </Card.Title>
        <Card.Text>
            <p>Here you can select up to four probes to retrieve specific metrics and compare them between the probes. </p>
            <p>To select a probe, click on a probe so that
            you can see the popup text, then click "Add Probe"</p>
            <p ><b style={{color: 'red'}}>Red</b> probes are offline</p>
            <p><b  style={{color: 'green'}}>Green</b> probes are online</p>
            

        </Card.Text>
    </Card.Body>
  </Card>
  <Card style={{marginBottom: '20px'}}>
    <Card.Body>
        { selectedProbes.length > 0 ?(
            <>
            <h3>Currently Selected Probes</h3>
            <ListGroup>
            {selectedProbes.map((probe)=>(
                <ListGroup.Item>Selected Probe: {probe.id} <CloseButton style={{float: 'right'}} onClick={()=>{removeProbe(probe.id)}}/></ListGroup.Item>
            ))}
            </ListGroup>
            </>
        ):(
            <>
            <Card.Title>
            Probe Selection
        </Card.Title>
        <Card.Text>
            <p>Click on a probe then click "Add Probe". If no probe is selected, the most recently selected probe will be added</p>
        </Card.Text>
            </>
        )}
        
    </Card.Body>
  </Card>

  
  
  </Col>
  </Row>
  <Row>
  
  </Row>
  </Container>
  </div>
  
        </>
    )
}

export default PageRipeAtlas