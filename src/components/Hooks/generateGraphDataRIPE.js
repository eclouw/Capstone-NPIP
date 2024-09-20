import axios from "axios";
const generateGraphDataRIPE = async(graphData, metric, group, between=false) => {
    let data = [];
    let labelData = [];
    let Dataset = [];
    
    

    const generate =  async() => {
        let FullData = [];
        let i = 0;
        if (between===true) {
            
            let bdata = [[], []];
            let labelText = '';
            for (let i = 0; i < 2; i++) {
                bdata[0].push(graphData[i][0][0].country);
            }
            
            
            for (let i = 0; i <2; i++) {

                switch (metric) {
                    case 'avg_download_latency_ms':
                        
                        
                        bdata[1].push(graphData[i][0][0].avg_download_latency_ms);
                        labelText = 'Average Download Latency ms'
                        
                        break;
                    case 'avg_download_speed_mbps':
                        
                        bdata[1].push(graphData[i][0][0].avg_download_speed_mbps);
                        labelText = 'Average Download Speed mbps'
                        break;
                    case 'avg_packet_loss':
                        bdata[1].push(graphData[i][0][0].avg_packet_loss);
                        labelText = 'Average Packet Loss'
                        break;
                    case 'avg_upload_speed_mbps':
                        bdata[1].push(graphData[i][0][0].avg_upload_speed_mbps);
                        labelText = 'Average Upload Speed mbps'
                        break;
                    case 'avg_upload_latency_ms':
                        bdata[1].push(graphData[i][0][0].avg_upload_latency_ms);
                        labelText = 'Average Upload Latency ms'
                        break;
                    case 'download_num_tests':
                        bdata[1].push(graphData[i][0][0].download_num_tests);
                        labelText = 'Number of download tests'
                        break;
                    case 'upload_num_tests':
                        bdata[1].push(graphData[i][0][0].upload_num_tests);
                        labelText = 'Number of upload tests'
                        break;
                }
                

            }
                
                
                
                bdata =  arrayMapper(labelText, bdata[0], bdata[1]);
                
                
                return bdata;

        } else {
            
            data = [];
            console.log(graphData)
            for (let i = 0; i < graphData.length; i++) {
                console.log(i);
                switch (metric) {
                    case 'avg_rtt':
                        
                                
                        Dataset = graphData[i].data.map((item) => item.avg_rtt);
                        switch (group) {
                            case 'month':
                                
                                labelData = graphData[i].data.map((item) => item.month);
                                data =  await arrayMapper('Average Round Trip Time per month', labelData, Dataset);
                                break;
                            case 'year':
                                labelData = graphData[i].data.map((item) => item.year);
                                data =  await arrayMapper('Average Round Trip Time per year', labelData, Dataset);
                                break;
                        }
                    break;

                    case 'max_rtt':
                        
                        Dataset = graphData[i].data.map((item) => item.max_rtt);
                        switch (group) {
                            case 'month':
                                labelData = graphData[i].data.map((item) => item.month);
                                data =  await arrayMapper('Average Round Trip Time per month', labelData, Dataset);
                                break;
                            case 'year':
                                labelData = graphData[i].data.map((item) => item.year);
                                data =  await arrayMapper('Average Round Trip Time per year', labelData, Dataset);
                                break;
                        }
                    break;

                    case 'min_rtt':
                        
                        Dataset = graphData[i].data.map((item) => item.min_rtt);
                        switch (group) {
                            case 'month':
                                labelData = graphData[i].data.map((item) => item.month);
                                data =  await arrayMapper('Average Round Trip Time per month', labelData, Dataset);
                                break;
                            case 'year':
                                labelData = graphData[i].data.map((item) => item.year);
                                data =  await arrayMapper('Average Round Trip Time per year', labelData, Dataset);
                                break;
                        }
                    break;
                    default:
                        
                        break;
                    

                }
                FullData.push(data);
            }

            
        }
        
        
        return FullData;
    }





    const arrayMapper =  async(labelText, labelData, dataSetData) => {
        const data = {
            labels: labelData,
            datasets: [
                {
                    label: labelText,
                    data: dataSetData,
                    backgroundColor: ["#Ffffff"],
                    fill: false,
                    borderColor: "black",
                    borderWidth: 2,
                },
            ],
        };
        
        
        return data;
    };

    return generate();

}

export default generateGraphDataRIPE;