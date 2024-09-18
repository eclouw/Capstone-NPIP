import './styles.css'
import { useEffect, useState } from 'react';
import axios from 'axios';
import getMLABDATA from '../Hooks/getMLABDATA';
import { Dropdown, Button, Card, Spinner, Tab, Tabs } from 'react-bootstrap';
import BarChart from '../BarChart';
import { Chart, registerables } from 'chart.js';
import generateGraphDataMLAB from '../Hooks/generateGraphDataMLAB';
<link ref="https://cdn.jsdelivr.net/npm/bootstrap-dark-5@1.1.3/dist/css/bootstrap-dark.min.css" rel="stylesheet"></link>
Chart.register(...registerables);

function MLABPage() {
    const [countryList, setCountryList] = useState(['Please Select a Country']);
    const [country, setCountry] = useState([{ name: null, index: 0 }, { name: null, index: 1 }])
    const [graphData, setGraphData] = useState([])
    const [year, setYear] = useState('2024');
    const [group, setGroup] = useState('city');
    const [metric, setMetric] = useState('avg_download_speed_mbps');
    const [readyForParam, setReadyForParam] = useState(false);
    const [countryListLoaded, setCountryListLoad] = useState(false);
    const [graphDataReady, setGraphDataReady] = useState(false)
    const [graphsChanged, setGraphsChanged] = useState(false)
    const [metricTextMap, setMetricTextMap] = useState('Average Download Speed (mbps)');
    const [groupTextMap, setGroupTextMap] = useState('City');
    const [graphCountries, setGraphCountries] = useState([[],[]]);

    useEffect(() => {

        getCountryList();
    }, [country, year, metric, group, readyForParam, graphsChanged, graphData])

    //FUNCTION FOR WHEN THE USER SELECTS A COUNTRY FROM THE DROPDOWN
    const handleCountrySelect = (sCountry, index) => {
        const data = [...country]
        data[index].name = sCountry
        setCountry(data);
        console.log(country);
        if (bothSelected()) {
            setReadyForParam(true);
        }
    }

    //FUNCTION FOR WHEN THE USER SELECTS A YEAR FROM THE DROPDOWN
    const handleYearSelect = (year) => {
        setYear(year);
    }

    const handleMetricSelect = (metric) => {
        switch(metric){
            case 'avg_upload_speed_mbps':
                setMetricTextMap('Average Upload Speed (mbps)');
                break;
            case 'avg_download_speed_mbps':
                setMetricTextMap('Average Download Speed (mbps)');
                break;
            case 'avg_download_latency_ms':
                setMetricTextMap('Average Download Latency (ms)');
                break;
            case 'avg_packet_loss':
                setMetricTextMap('Average Packet Loss');
                break;
            case 'avg_upload_latency_ms':
                setMetricTextMap('Average Upload Latency (ms)');
                break;
        }
        setMetric(metric);
    }

    const handleGroupSelect = (group) => {
        setGroup(group);
    }

    //DETERMINE WHETHER THE USER HAS TWO COUNTRIES SELECTED
    const bothSelected = () => {
        console.log('checking')
        let bSelected = true;
        for (let i = 0; i < country.length; i++) {
            if (country[i].name === null) {
                console.log(country[i].name);
                bSelected = false;
            }
        }
        return bSelected;
    }

    //LOAD A LIST OF COUNTRIES THAT HAVE DATA
    const getCountryList = async () => {
        const cList = await getMLABDATA('all', '2024', 'country', 'compute')
        setCountryList(cList.data);
        setCountryListLoad(true);

    }

    const generateGraphs = async () => {
        let data = [];
        setGraphData([]);
        if (await fetchGraphData()) {
            setGraphDataReady(false);
            console.log('time for mapping')
            data = await generateGraphDataMLAB(graphData, metric, group);
            setGraphData(data);
            console.log('Graph data')
            console.log(graphData)
            setGraphDataReady(true);
            setGraphsChanged(true);
            console.log('graphdata length')
            console.log(graphData.length)
            console.log(graphData)
        }


    }

    const fetchGraphData = async () => {
        const data = [];
        console.log('country array length')
        console.log(country.length)
        for (let i = 0; i < country.length; i++) {
            console.log(country[i].name);
            const response = await fetchData(country[i].name, year, group);
            graphData[i] = [response.data]

        }

        return true;


    }

    const fetchData = async (country, year, grouping) => {
        const response = await getMLABDATA(country, year, grouping, 'compute');
        console.log('response from hook')
        console.log(response)
        return response;
    }



    return (
        <div class='MLABPage'>
            <Card>
                <Card.Body>This page can get MLAB data for specific queries to either compare data within two contries or to compare the data between two countries</Card.Body>
            </Card>
            <div class="row">
                {country.map((country) => (
                    <div class="col">
                        <h2>Selected country: {country.name}</h2>

                        
                        {countryListLoaded && (
                            <>
                                <Dropdown>
                                    <Dropdown.Toggle>
                                        Select a country
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        {countryList.map((countryList) => (

                                            <Dropdown.Item as="button" key={countryList.country} onClick={() => handleCountrySelect(countryList.country, country.index)}>{countryList.country}</Dropdown.Item>

                                        ))}
                                    </Dropdown.Menu>
                                </Dropdown>
                            </>

                        )}

                    </div>

                ))}

            </div>

            <Tabs defaultActiveKey="innerCompare"
                            id="tabMLAB"
                            className='mb-3'>
                            <Tab eventKey="innerCompare" title="Compare data within countries">

                                {readyForParam && (
                                    <>
                                        <h2>Selected year: {year}</h2>
                                        <Dropdown>
                                            <Dropdown.Toggle>
                                                Select a year
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item as="button" key='2020' onClick={() => handleYearSelect('2020')}>2020</Dropdown.Item>
                                                <Dropdown.Item as="button" key='2021' onClick={() => handleYearSelect('2021')}>2021</Dropdown.Item>
                                                <Dropdown.Item as="button" key='2022' onClick={() => handleYearSelect('2022')}>2022</Dropdown.Item>
                                                <Dropdown.Item as="button" key='2023' onClick={() => handleYearSelect('2023')}>2023</Dropdown.Item>
                                                <Dropdown.Item as="button" key='2024' onClick={() => handleYearSelect('2024')}>2024</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>

                                        <h2>Selected metric: {metricTextMap}</h2>
                                        <Dropdown>
                                            <Dropdown.Toggle>
                                                Select a metric
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item as="button" key='avg_download_latency_ms' onClick={() => handleMetricSelect('avg_download_latency_ms')}>Average Download Latency ms</Dropdown.Item>
                                                <Dropdown.Item as="button" key='avg_download_speed_mbps' onClick={() => handleMetricSelect('avg_download_speed_mbps')}>Average Download Speed mbps</Dropdown.Item>
                                                <Dropdown.Item as="button" key='avg_packet_loss' onClick={() => handleMetricSelect('avg_packet_loss')}>Average Packet Loss</Dropdown.Item>
                                                <Dropdown.Item as="button" key='avg_upload_latency_ms' onClick={() => handleMetricSelect('avg_upload_latency_ms')}>Average Upload Latency ms</Dropdown.Item>
                                                <Dropdown.Item as="button" key='avg_upload_speed_mbps' onClick={() => handleMetricSelect('avg_upload_speed_mbps')}>Average Upload Speed mbps</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>

                                        <h2>Selected a grouping: {group}</h2>
                                        <Dropdown>
                                            <Dropdown.Toggle>
                                                Select a grouping
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item as="button" key='month' onClick={() => handleGroupSelect('month')}>Month</Dropdown.Item>
                                                <Dropdown.Item as="button" key='region' onClick={() => handleGroupSelect('region')}>Region</Dropdown.Item>
                                                <Dropdown.Item as="button" key='city' onClick={() => handleGroupSelect('city')}>City</Dropdown.Item>
                                                <Dropdown.Item as="button" key='as_name' onClick={() => handleGroupSelect('as_name')}>AS Name</Dropdown.Item>
                                                <Dropdown.Item as="button" key='as_number' onClick={() => handleGroupSelect('as_number')}>AS Number</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>

                                        <Button onClick={() => generateGraphs()}>Generate graphs</Button>

                                        {graphDataReady && graphData.length > 0 ? (
                                    <div>
                                        {graphData.map((currentGraph, index) => (

                                            <p><BarChart chartData={currentGraph} /></p>

                                        ))}
                                    </div>
                                ):(
                                    <p><i>Please click generate to generate a graph, if you have already clicked generate, please wait a few seconds</i></p>
                                )}
                                    </>
                                )}
                               

                            </Tab>
                            <Tab eventKey="betweenCompare" title="Compare data between countries">

                            </Tab>
                        </Tabs>




        </div>

    )

}

export default MLABPage;