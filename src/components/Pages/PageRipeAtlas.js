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
import { Card, Button, ListGroup, CloseButton, Dropdown, Tab, Tabs, InputGroup, Form } from "react-bootstrap";
import dataMeasurements from "../../dataStorage/measurements";
import generateProbeRequest from "../Hooks/generateProbeRequest";
import getRIPEDATADIRECT from "../Hooks/getRIPEDATADIRECT";
import generateGraphDataRIPE from "../Hooks/generateGraphDataRIPE";
import GraphFactory from "../GraphFactory";


//WEB PAGE FOR GETTING RIPE ATLAS DATA
function PageRipeAtlas() {
    const position = [17, 0]
    const [measurementTargets, setMeasurementTargets] = useState([]);
    const [probeMapData, setProbeMapData] = useState([]);
    const [probeMapDataReady, setProbeMapDataReady] = useState([false])
    const [selectedProbes, setSelectedProbes] = useState([]);
    const [yearYear, setYearYear] = useState('2024')
    const [metricYear, setMetricYear] = useState('RTT Average')
    const [measurementYear, setMeasurementYear] = useState('a.root-servers.net');
    const [dataMeasuresTextReady, setDataMeasuresTextReady] = useState(false);
    const [graphDataYear, setGraphDataYear] = useState([], [], [], [])
    const [yearDataReady, setYearDataReady] = useState(false);
    const [searchProbe, setSearchProbe] = useState('');
    const [userHasSearched, setUserHasSearched] = useState(false)
    const [foundSearch, setFoundSearch] = useState(false);

    //GET THE PROBE MARKERS FOR THE MAP
    useEffect(() => {
        const getProbeMarkers = async () => {
            try{
                const response = await getRipeProbes();
                setProbeMapData(response);
            }catch(error){
                console.log(error);
            }
            
        }
        const getMeasureMeantDetails = async () => {
            try{
                const data = await dataMeasurements();
                setMeasurementTargets(data);
                setDataMeasuresTextReady(true);
            }catch(error){
                console.log(error);
            }
            
        }
        getProbeMarkers();
        getMeasureMeantDetails();
    }, [])

    //ADD A SELECT PROBE TO THE SELETED PROBE ARRAY
    const addSelectedProbe = (id) => {
        if (selectedProbes.length < 4) {
            const index = selectedProbes.findIndex(item => item.id === id);
            if (index !== -1) {
            } else {
                let data = ([]);
                data.push({ id: id });
                setSelectedProbes((currentSelectedProbes) => ([...currentSelectedProbes, ...data]));

            }
        }



    }

    //SET THE YEAR VALUE FOR THE QUERY
    const setYearValue = (year, key) => {
        if (key === 'year') {
            setYearYear(year);
        }
    }
    //SET THE METRIC VALUE FOR THE QUERY
    const setMetricValue = (metric, key) => {
        if (key === 'year') {
            setMetricYear(metric);
        }
    }
    //SET THE MEASUREMENT VALUE FOR THE QUERY
    const setMeasurementValue = (measurement, key) => {
        if (key === 'year') {
            setMeasurementYear(measurement);
        }

    }
    //SET THE MONTH VALUE FOR THE QUERY
    const setMonthValue = (month) => {
        setMonthValue(month);
    }

    //REMOVE A PROBE FROM THE SELECTED PROBE ARRAY
    const removeProbe = (removeID) => {
        const index = selectedProbes.findIndex(item => item.id === removeID);
        if (index !== -1) {
            const data = [...selectedProbes.slice(0, index), ...selectedProbes.slice(index + 1)];
            setSelectedProbes(data);
        }
    }

    //GET THE DATA FOR USER QUERY FOR SELECTED PROBES AND MAP THEM INTO DATA THAT CHARTJS CAN READ
    const getCommand = async (key) => {
        let data = []
        if (key === 'year') {
            setYearDataReady(false);
            setGraphDataYear([])
            let metricKey = ''
            switch (metricYear) {
                case 'RTT Average':
                    metricKey = 'avg_rtt'
                    break;
                case 'RTT Min':
                    metricKey = 'min_rtt'
                    break;
                case 'RTT Max':
                    metricKey = 'max_rtt'
                    break;
            }
            for (let i = 0; i < selectedProbes.length; i++) {
                let request = generateProbeRequest([[{ key: 'year', value: yearYear }], [{ key: 'group', value: 'month' }]], parseInt(selectedProbes[i].id));
                console.log(request);
                const response = await getRIPEDATADIRECT(request);
                console.log(response);
                data[i] = response;
                console.log('data')
                console.log(data);


            }



            const gData = await generateGraphDataRIPE(data, metricKey, 'month');
            let filtered = gData.filter(item => !item.length);
            await setGraphDataYear(gData);
            setYearDataReady(true);
           
            
            console.log(graphDataYear)
            console.log(gData);


        }
    }

    //USEEFFECT TO TELL THE UI TO REFRESH WHEN CERTAIN CONSTS ARE CHANGED
    useEffect(() => {
        console.log(yearDataReady);
        console.log('Graph Data')
        console.log(graphDataYear)
        if (probeMapData.length > 0) {

            setProbeMapDataReady(true);
        } else {
            setProbeMapDataReady(false);


        }



    }, [probeMapData], [selectedProbes], [measurementTargets], [dataMeasuresTextReady], [graphDataYear], [yearDataReady], [foundSearch])

    //SET THE VALUE FOR THE PROBESEARCH IF A USER IS USING THE SEARCH BAR
    const setValueSearchProbe=(value)=>{
        setSearchProbe(value);
    }

    //SEARCH FOR A SPECIFIED PROBE
    const searchForProbe=()=>{
        setUserHasSearched(false);
        setFoundSearch(false);
        let found = false;
        if (probeMapData.length > 0){
            console.log(searchProbe);
            for (let i = 0; i < probeMapData.length;i++){
                if (probeMapData[i].id == searchProbe){
                    found = true;
                addSelectedProbe(searchProbe);
                setFoundSearch(true);
                return;
                }
                
            
            }
        }


        setUserHasSearched(true);
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
        <>  <div className="Ripe" data-bs-theme="dark">
            <Row>
            <Col>
            <InputGroup className="mb-3">
                    <InputGroup.Text id="probeSearch">Probe Number</InputGroup.Text>
                    <Form.Control
                        value={searchProbe}
                        onChange={(e) => setValueSearchProbe(e.target.value)}
                        placeholder="Probe Number"
                        aria-label="ProbeNumber"
                        aria-describedby="basic-addon1"
                    />
                    <Button id="probeSelectButton" onClick={() => { searchForProbe() }}>Select</Button>
                </InputGroup>
                {userHasSearched && foundSearch &&(
                    <p>Added Probe</p>
                )}

                {userHasSearched && !foundSearch &&(
                    <p>Probe not found</p>
                )}
                    
                
                
            </Col>
                
            </Row>
            
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
                                                        <Marker position={[marker.lat, marker.lng]} icon={iconGreen} id={marker.id}>
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
                                                        <Marker position={[marker.lat, marker.lng]} icon={iconRed}>
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


                    </Row>
                </Container>

                <Tabs defaultActiveKey="yearly" id="tabRIPE" className='mb-3'>
                    <Tab eventKey="yearly" title="Data for specific year">
                        <Card style={{ maxWidth: '100%' }}>
                            <Card.Body>
                                <h3>Selected Measurement: {measurementYear}</h3>
                                {measurementTargets.length > 0 && dataMeasuresTextReady && (
                                    <Dropdown>
                                        <Dropdown.Toggle>
                                            Select a Measurement
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            {measurementTargets.map((data) => (
                                                <Dropdown.Item as="button" key={data.target} onClick={() => setMeasurementValue(data.target, 'year')}>
                                                    {data.target}
                                                </Dropdown.Item>

                                            ))}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                )}

                                <h3>Selected Year: {yearYear}</h3>
                                <Dropdown>
                                    <Dropdown.Toggle>
                                        Select a Year
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>

                                        <Dropdown.Item as="button" key='2020Year' onClick={() => setYearValue('2020', 'year')}>2021</Dropdown.Item>
                                        <Dropdown.Item as="button" key='2021Year' onClick={() => setYearValue('2021', 'year')}>2020</Dropdown.Item>
                                        <Dropdown.Item as="button" key='2022Year' onClick={() => setYearValue('2022', 'year')}>2022</Dropdown.Item>
                                        <Dropdown.Item as="button" key='2023Year' onClick={() => setYearValue('2023', 'year')}>2023</Dropdown.Item>
                                        <Dropdown.Item as="button" key='2024Year' onClick={() => setYearValue('2024', 'year')}>2024</Dropdown.Item>


                                    </Dropdown.Menu>
                                </Dropdown>

                                <h3>Metric: {metricYear}</h3>
                                <Dropdown>
                                    <Dropdown.Toggle>
                                        Select a Metric
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>

                                        <Dropdown.Item as="button" key='rttMinYear' onClick={() => setMetricValue('RTT Min', 'year')}>RTT Min</Dropdown.Item>
                                        <Dropdown.Item as="button" key='rttMaxYear' onClick={() => setMetricValue('RTT Max', 'year')}>RTT Max</Dropdown.Item>
                                        <Dropdown.Item as="button" key='rttAverageYear' onClick={() => setMetricValue('RTT Average', 'year')}>RTT Average</Dropdown.Item>



                                    </Dropdown.Menu>
                                </Dropdown>


                                {selectedProbes.length > 0 ? (
                                    <Button variant="primary" size="lg" style={{ marginTop: '20px' }} onClick={() => getCommand('year')}>
                                        Generate Graphs
                                    </Button>
                                ) : (
                                    <Button variant="primary" size="lg" disabled style={{ marginTop: '20px' }}>
                                        Please select at least one probe
                                    </Button>
                                )}
                                <div>
                                    {yearDataReady && graphDataYear.length > 0 && (
                                        <>
                                            <p>READY</p>

                                            {graphDataYear.map((item, index) => (

                                                <>
                                                    {selectedProbes}
                                                    <GraphFactory chartData={item} type={'bar'}/>
                                                </>


                                            ))}
                                        </>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>

                    </Tab>

                </Tabs>

            </div>


        </>
    )
}

export default PageRipeAtlas