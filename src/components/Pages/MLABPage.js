import './styles.css'
import { useEffect, useState } from 'react';
import axios from 'axios';
import getMLABDATA from '../Hooks/getMLABDATA';
import { Dropdown, Button, Card, Spinner, Tab, Tabs } from 'react-bootstrap';
import BarChart from '../BarChart';
import { Chart, registerables } from 'chart.js';
import generateGraphDataMLAB from '../Hooks/generateGraphDataMLAB';
import LineChart from '../LineChart';
<link ref="https://cdn.jsdelivr.net/npm/bootstrap-dark-5@1.1.3/dist/css/bootstrap-dark.min.css" rel="stylesheet"></link>
Chart.register(...registerables);

function MLABPage() {
    const [countryList, setCountryList] = useState(['Please Select a Country']);
    const [country, setCountry] = useState([{ name: null, index: 0 }, { name: null, index: 1 }])
    const [graphData, setGraphData] = useState([])
    const [betweenGraphData, setBetweenGraphData] = useState([])
    const [year, setYear] = useState('2024');
    const [group, setGroup] = useState('city');
    const [metric, setMetric] = useState('avg_download_speed_mbps');
    const [readyForParam, setReadyForParam] = useState(false);
    const [countryListLoaded, setCountryListLoad] = useState(false);
    const [graphDataReady, setGraphDataReady] = useState(false)
    const [graphsChanged, setGraphsChanged] = useState(false)
    const [metricTextMap, setMetricTextMap] = useState('Average Download Speed (mbps)');
    const [graphCountries, setGraphCountries] = useState([[],[]]);
    const [betweenMetric, setMetricBetween] = useState('avg_download_speed_mbps');
    const [betweenYear, setBetweenYear]= useState('2024')
    const [metricBetweenTextMap, setMetricBetweenTextMap]= useState('Average Download Speed (mbps)')
    const [betweenGraphDataReady, setBetweenGraphDataReady] = useState(false)
    const [betweenGraphDataFormatted, setBetweenGraphDataFormatted] = useState([]);

    useEffect(() => {

        getCountryList();
    }, [country, year, metric, group, readyForParam, graphsChanged, graphData, betweenGraphData])

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
    const handleYearSelect = (year, between) => {
        if (between){
            setBetweenYear(year);
        }else{
            setYear(year);
        }
        
    }

    const handleMetricSelect = (metric, between) => {
        if (between){
            switch(metric){
                case 'avg_upload_speed_mbps':
                    setMetricBetweenTextMap('Average Upload Speed (mbps)');
                    break;
                case 'avg_download_speed_mbps':
                    setMetricBetweenTextMap('Average Download Speed (mbps)');
                    break;
                case 'avg_download_latency_ms':
                    setMetricBetweenTextMap('Average Download Latency (ms)');
                    break;
                case 'avg_packet_loss':
                    setMetricBetweenTextMap('Average Packet Loss');
                    break;
                case 'avg_upload_latency_ms':
                    setMetricBetweenTextMap('Average Upload Latency (ms)');
                    break;
            }
            setMetricBetween(metric);
        }else{
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
        const cList = await getMLABDATA('all', '2024', 'country', 'compute', false)
        setCountryList(cList.data);
        setCountryListLoad(true);

    }



    const generateGraphs = async (between) => {
        if (between){
            console.log('between is true')
            setBetweenGraphData([]);
            if (await fetchGraphData(true)){
                setBetweenGraphDataReady(false);
                const data = await generateGraphDataMLAB(betweenGraphData, betweenMetric, null, true);
                console.log(data);
                console.log('above');
                setBetweenGraphData(data)
                setBetweenGraphDataFormatted(data)
                setBetweenGraphDataReady(true)
            }
            console.log(betweenGraphData)
            
        }else{
            console.log('between is false')
            let data = [];
            setGraphDataReady(false);
            setGraphData([]);
        if (await fetchGraphData(false)) {
            
            console.log('time for mapping')
            const data = await generateGraphDataMLAB(graphData, metric, group,false);
            await setGraphData(data);
            console.log('Graph data')
            console.log(graphData)
            setGraphDataReady(true);
            setGraphsChanged(true);
            console.log('graphdata length')
            console.log(graphData.length)
            console.log(graphData)
        }
        }
        


    }

    const fetchGraphData = async(between) => {
        
        const data = [];
        console.log('country array length')
        console.log(country.length)
        for (let i = 0; i < country.length; i++) {
            console.log(country[i].name);
            if (between){
                const response = await fetchData(country[i].name, betweenYear, 'country');
                betweenGraphData[i] = [response.data]
            }else{
                const response = await fetchData(country[i].name, year, group);
                graphData[i] = [response.data]
            }
            
            

        }

        return true;


    }

    const fetchData = async (country, year, grouping) => {
        const response = await getMLABDATA(country, year, grouping, 'compute', false);
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

                                {readyForParam ? (
                                    <>
                                        <h2>Selected year: {year}</h2>
                                        <Dropdown>
                                            <Dropdown.Toggle>
                                                Select a year
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item as="button" key='2020' onClick={() => handleYearSelect('2020',false)}>2020</Dropdown.Item>
                                                <Dropdown.Item as="button" key='2021' onClick={() => handleYearSelect('2021',false)}>2021</Dropdown.Item>
                                                <Dropdown.Item as="button" key='2022' onClick={() => handleYearSelect('2022',false)}>2022</Dropdown.Item>
                                                <Dropdown.Item as="button" key='2023' onClick={() => handleYearSelect('2023',false)}>2023</Dropdown.Item>
                                                <Dropdown.Item as="button" key='2024' onClick={() => handleYearSelect('2024',false)}>2024</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>

                                        <h2>Selected metric: {metricTextMap}</h2>
                                        <Dropdown>
                                            <Dropdown.Toggle>
                                                Select a metric
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item as="button" key='avg_download_latency_ms' onClick={() => handleMetricSelect('avg_download_latency_ms',false)}>Average Download Latency ms</Dropdown.Item>
                                                <Dropdown.Item as="button" key='avg_download_speed_mbps' onClick={() => handleMetricSelect('avg_download_speed_mbps',false)}>Average Download Speed mbps</Dropdown.Item>
                                                <Dropdown.Item as="button" key='avg_packet_loss' onClick={() => handleMetricSelect('avg_packet_loss',false)}>Average Packet Loss</Dropdown.Item>
                                                <Dropdown.Item as="button" key='avg_upload_latency_ms' onClick={() => handleMetricSelect('avg_upload_latency_ms',false)}>Average Upload Latency ms</Dropdown.Item>
                                                <Dropdown.Item as="button" key='avg_upload_speed_mbps' onClick={() => handleMetricSelect('avg_upload_speed_mbps',false)}>Average Upload Speed mbps</Dropdown.Item>
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

                                        <Button onClick={() => generateGraphs(false)}>Generate graphs</Button>

                                        {graphDataReady && graphData.length ===2 ? (
                                    <div>
                                        {graphData?.map((currentGraph) => (
                                             <Tabs defaultActiveKey="barGraphInner"
                                             id="chartTypeInner"
                                             className='mb-3'>
                                                <Tab eventKey="barGraphInner" title="Bar Graph">
                                                    <p><BarChart chartData={currentGraph} /></p>
                                                </Tab>
                                                <Tab eventKey="lineGraphInner" title="Line Graph">
                                                    <p><LineChart chartData={currentGraph} /></p>
                                                </Tab>
                                            
                                            </Tabs>

                                        ))}
                                    </div>
                                ):(
                                    <p><i>Please click generate to generate a graph, if you have already clicked generate, please wait a few seconds</i></p>
                                )}
                                    </>
                                ):(
                                    <p><i>Please Select Your countries</i></p>
                                )}
                               

                            </Tab>
                            <Tab eventKey="betweenCompare" title="Compare data between countries">
                                {readyForParam ?(
                                    <>
                                        <h2>Selected year: {betweenYear}</h2>
                                        <Dropdown>
                                            <Dropdown.Toggle>
                                                Select a year
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item as="button" key='2021B' onClick={() => handleYearSelect('2021', true)}>2021</Dropdown.Item>
                                                <Dropdown.Item as="button" key='2022B' onClick={() => handleYearSelect('2022', true)}>2022</Dropdown.Item>
                                                <Dropdown.Item as="button" key='2020B' onClick={() => handleYearSelect('2020', true)}>2020</Dropdown.Item>
                                                <Dropdown.Item as="button" key='2023B' onClick={() => handleYearSelect('2023', true)}>2023</Dropdown.Item>
                                                <Dropdown.Item as="button" key='2024B' onClick={() => handleYearSelect('2024', true)}>2024</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                        <h2>Selected metric: {metricBetweenTextMap}</h2>
                                        <Dropdown>
                                            <Dropdown.Toggle>
                                                Select a metric
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item as="button" key='avg_download_latency_msB' onClick={() => handleMetricSelect('avg_download_latency_ms',true)}>Average Download Latency ms</Dropdown.Item>
                                                <Dropdown.Item as="button" key='avg_download_speed_mbpsB' onClick={() => handleMetricSelect('avg_download_speed_mbps',true)}>Average Download Speed mbps</Dropdown.Item>
                                                <Dropdown.Item as="button" key='avg_packet_lossB' onClick={() => handleMetricSelect('avg_packet_loss',true)}>Average Packet Loss</Dropdown.Item>
                                                <Dropdown.Item as="button" key='avg_upload_latency_msB' onClick={() => handleMetricSelect('avg_upload_latency_ms',true)}>Average Upload Latency ms</Dropdown.Item>
                                                <Dropdown.Item as="button" key='avg_upload_speed_mbpsB' onClick={() => handleMetricSelect('avg_upload_speed_mbps',true)}>Average Upload Speed mbps</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                        <Button onClick={() => generateGraphs(true)}>Generate graphs</Button>
                                       {betweenGraphDataReady ?(
                                        <BarChart chartData={betweenGraphData}/>
                                       ):(
                                        <p><i>Please click generate to generate a graph, if you have already clicked generate, please wait a few seconds</i></p>
                                       )}
                                    </>
                                    
                                    
                                ):(
                                    <p><i>Please Select Your countries</i></p>
                                )}
                            </Tab>
                        </Tabs>




        </div>

    )

}

export default MLABPage;