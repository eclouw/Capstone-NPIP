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
import { Card, Button, ListGroup, CloseButton, Dropdown } from "react-bootstrap";
import getRIPEDATA from "../Hooks/getRIPEDATA";
import dataMeasurements from "../../dataStorage/measurements";
import SidebarMenu, { SidebarMenuBody } from "react-bootstrap-sidebar-menu";


function PageRipeAtlas() {
    const position = [17, 0]
    const [measurementTargets, setMeasurementTargets] = useState([]);
    const [probeMapData, setProbeMapData] = useState([]);
    const [probeMapDataReady, setProbeMapDataReady] = useState([false])
    const [selectedProbes, setSelectedProbes] = useState([]);
    const [measurement, setMeasurement] = useState();
    const [year, setYear] = useState();
    const [month, setMonth] = useState();
    const [group, setGroup] = useState();
    const [dataMeasuresTextReady, setDataMeasuresTextReady] = useState(false);

    useEffect(() => {
        console.log(dataMeasurements);
        const getProbeMarkers = async () => {
            const response = await getRipeProbes();
            setProbeMapData(response);

        }
        const getMeasureMeantDetails = async () => {
            const data = await dataMeasurements();
            setMeasurementTargets(data);
            setDataMeasuresTextReady(true);

        }
        getProbeMarkers();
        getMeasureMeantDetails();
    }, [])

    const addSelectedProbe = (id) => {
        const index = selectedProbes.findIndex(item => item.id === id);
        if (index !== -1) {
            console.log('Already selected')
        } else {
            let data = ([]);
            data.push({ id: id });
            setSelectedProbes((currentSelectedProbes) => ([...currentSelectedProbes, ...data]));
        }


    }

    const setYearValue = (year) => {
        setYear(year)
    }

    const setMeasurementValue = (measurement) => {
        setMeasurement(measurement);
    }

    const setMonthValue = (month) => {
        setMonthValue(month);
    }

    const setGroupValue = (group) => {
        setGroup(group);
    }

    const removeProbe = (removeID) => {
        const index = selectedProbes.findIndex(item => item.id === removeID);
        if (index !== -1) {
            const data = [...selectedProbes.slice(0, index), ...selectedProbes.slice(index + 1)];
            setSelectedProbes(data);
        }
    }

    useEffect(() => {
        if (probeMapData.length > 0) {

            setProbeMapDataReady(true);
        } else {
            setProbeMapDataReady(false);


        }
        console.log(dataMeasuresTextReady);
        console.log(measurementTargets);

    }, [probeMapData], [selectedProbes], [measurementTargets], [dataMeasuresTextReady])

    const test = (id) => {
        console.log(id);
    }

    const generateGraph = (id) => {
        console.log(getRIPEDATA('62557', 'compute', '1009', 'year', 2020));
    }

    const iconGreen = new Icon({
        iconUrl: "/data/marker-green.png",
        iconSize: [38, 38]
    })

    const iconRed = new Icon({
        iconUrl: "/data/marker-red.png",
        iconSize: [38, 38]
    })
    return (
        <>
            <div>
                <Container>
                    <Row>
                        <Col xs={25} style={{ marginTop: '20px' }}>
                            <Card >

                                <MapContainer center={position} zoom={3} scrollWheelZoom={true} >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    {probeMapData.length > 0 && probeMapDataReady && (
                                        <>
                                            {probeMapData.map(marker => (
                                                <MarkerClusterGroup>

                                                    {marker.status === 1 ? (
                                                        <Marker position={[marker.lat, marker.lng]} icon={iconGreen} id={marker.id} eventHandlers={{
                                                            click: () => {
                                                                test(marker.id);
                                                            },
                                                        }}>
                                                            <Popup>
                                                                <b>Country Code: </b>{marker.countryCode}<br />
                                                                <b>Probe ID: </b>{marker.id}<br />
                                                                <b>Supports IPv4: </b>{marker.supports_v4.toString()}<br />
                                                                <b>Supports IPv6: </b>{marker.supports_v6.toString()}<br />
                                                                <b>System Type: </b>{marker.system_type}<br />
                                                                <b>SStatus: </b>{marker.status}<br />
                                                                <p><Button variant="success" onClick={() => { addSelectedProbe(marker.id) }}>Add Probe</Button></p>
                                                            </Popup>
                                                        </Marker>
                                                    ) : (
                                                        <Marker position={[marker.lat, marker.lng]} icon={iconRed} eventHandlers={{
                                                            click: () => {
                                                                test(marker.id);
                                                            },
                                                        }}>
                                                            <Popup>
                                                                <b>Country Code: </b>{marker.countryCode}<br />
                                                                <b>Probe ID: </b>{marker.id}<br />
                                                                <b>Supports IPv4: </b>{marker.supports_v4.toString()}<br />
                                                                <b>Supports IPv6: </b>{marker.supports_v6.toString()}<br />
                                                                <b>System Type: </b>{marker.system_type}<br />
                                                                <b>Status: </b>{marker.status}<br />
                                                                <p><Button variant="success" onClick={() => { addSelectedProbe(marker.id) }}>Add Probe</Button></p>

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
                            <Card style={{ marginBottom: '20px' }}>
                                <Card.Body>
                                    <Card.Title>
                                        <h3>Ripe Atlas Probe Data</h3>
                                    </Card.Title>
                                    <Card.Text>
                                        <p>Here you can select up to four probes to retrieve specific metrics and compare them between the probes. </p>
                                        <p>To select a probe, click on a probe so that
                                            you can see the popup text, then click "Add Probe"</p>
                                        <p ><b style={{ color: 'red' }}>Red</b> probes are offline</p>
                                        <p><b style={{ color: 'green' }}>Green</b> probes are online</p>


                                    </Card.Text>
                                </Card.Body>
                            </Card>
                            <Card style={{ marginBottom: '20px' }}>
                                <Card.Body>
                                    {selectedProbes.length > 0 ? (
                                        <>
                                            <h3>Currently Selected Probes</h3>
                                            <ListGroup>
                                                {selectedProbes.map((probe) => (
                                                    <ListGroup.Item>Selected Probe: {probe.id} <CloseButton style={{ float: 'right' }} onClick={() => { removeProbe(probe.id) }} /></ListGroup.Item>
                                                ))}
                                            </ListGroup>
                                        </>
                                    ) : (
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
                        <Button onClick={() => { generateGraph() }}>FEARLESS SPEAK NOW RED 1989 REPUTATION LOVER EVERMORE FOLKLORE MIDNIGHTS</Button>
                    </Row>
                    <Row>


                    </Row>
                </Container>
                <Card style={{ maxWidth: '100%' }}>
                    <Card.Body>
                        <h3>Selected Measurement: </h3>
                        {measurementTargets.length > 0 && dataMeasuresTextReady && (
                            <Dropdown>
                                <Dropdown.Toggle>
                                    Select a Measurement
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    {measurementTargets.map((data) => (
                                        <Dropdown.Item as="button" key={data.target} onClick={() => setMeasurementValue(data.target)}>
                                            {data.target}
                                        </Dropdown.Item>

                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                        )}


                    </Card.Body>
                </Card>
            </div>
            

        </>
    )
}

export default PageRipeAtlas