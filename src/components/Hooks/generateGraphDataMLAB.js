
//MAP DATA INTO A FORMAT THAT CHART JS CAN READ
const generateGraphDataMLAB = async (graphData, metric, group, between) => {
    let data = [];
    let labelData = [];
    let Dataset = [];
    
    

    const generate = async () => {
        let FullData = [[], []];
        let i = 0;
        if (between) {
            
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
                
                
                
                bdata = await arrayMapper(labelText, bdata[0], bdata[1]);
                
                
                return bdata;

        } else {

            data = [];
            for (let i = 0; i < graphData.length; i++) {
                switch (metric) {
                    case 'avg_download_latency_ms':
                        Dataset = graphData[i][0].map((item) => item.avg_download_latency_ms);
                        switch (group) {
                            case 'month':
                                labelData = graphData[i][0].map((item) => item.month);
                                data = await arrayMapper('Average Latency per month (ms)', labelData, Dataset);
                                break;
                            case 'region':
                                labelData = graphData[i][0].map((item) => item.region);
                                data = await arrayMapper('Average Latency per region (ms)', labelData, Dataset);
                                break;
                            case 'city':
                                labelData = graphData[i][0].map((item) => item.city);
                                data = await arrayMapper('Average Latency per city (ms)', labelData, Dataset);
                                break;
                            case 'as_name':
                                labelData = graphData[i][0].map((item) => item.as_name);
                                data = await arrayMapper('Average Latency per as (name) (ms)', labelData, Dataset);
                                break;
                            case 'as_number':
                                labelData = graphData[i][0].map((item) => item.as_number);
                                data = await arrayMapper('Average Latency per as (number) (ms)', labelData, Dataset);
                                break;
                        }
                        break;
                    case 'avg_download_speed_mbps':
                        Dataset = graphData[i][0].map((item) => item.avg_download_speed_mbps);
                        switch (group) {
                            case 'month':
                                labelData = graphData[i][0].map((item) => item.month);
                                data = await arrayMapper('Average Download Speed per month (mbps)', labelData, Dataset);
                                break;
                            case 'region':
                                labelData = graphData[i][0].map((item) => item.region);
                                data = await arrayMapper('Average Download Speed per region (mbps)', labelData, Dataset);
                                break;
                            case 'city':
                                labelData = graphData[i][0].map((item) => item.city);
                                data = await arrayMapper('Average Download Speed per city (mbps)', labelData, Dataset);
                                break;
                            case 'as_name':
                                labelData = graphData[i][0].map((item) => item.as_name);
                                data = await arrayMapper('Average Download Speed per as (name) (mbps)', labelData, Dataset);
                                break;
                            case 'as_number':
                                labelData = graphData[i][0].map((item) => item.as_number);
                                data = await arrayMapper('Average Download Speed per as (number) (mbps)', labelData, Dataset);
                                break;
                        }
                        break;
                    case 'avg_packet_loss':
                        Dataset = graphData[i][0].map((item) => item.avg_packet_loss);
                        switch (group) {
                            case 'month':
                                labelData = graphData[i][0].map((item) => item.month);
                                data = await arrayMapper('Average Packet Loss per month', labelData, Dataset);
                                break;
                            case 'region':
                                labelData = graphData[i][0].map((item) => item.region);
                                data = await arrayMapper('Average Packet Loss per region', labelData, Dataset);
                                break;
                            case 'city':
                                labelData = graphData[i][0].map((item) => item.city);
                                data = await arrayMapper('Average Packet Loss per city', labelData, Dataset);
                                break;
                            case 'as_name':
                                labelData = graphData[i][0].map((item) => item.as_name);
                                data = await arrayMapper('Average Packet Loss per as (name)', labelData, Dataset);
                                break;
                            case 'as_number':
                                labelData = graphData[i][0].map((item) => item.as_number);
                                data = await arrayMapper('Average Packet Loss per as (number)', labelData, Dataset);
                                break;
                        }
                        break;
                    case 'avg_upload_latency_ms':
                        Dataset = graphData[i][0].map((item) => item.avg_upload_latency_ms);
                        switch (group) {
                            case 'month':
                                labelData = graphData[i][0].map((item) => item.month);
                                data = await arrayMapper('Average Upload Latency Loss per month (ms)', labelData, Dataset);
                                break;
                            case 'region':
                                labelData = graphData[i][0].map((item) => item.region);
                                data = await arrayMapper('Average Upload Latency per region (ms)', labelData, Dataset);
                                break;
                            case 'city':
                                labelData = graphData[i][0].map((item) => item.city);
                                data = await arrayMapper('Average Upload Latency Loss per city (ms)', labelData, Dataset);
                                break;
                            case 'as_name':
                                labelData = graphData[i][0].map((item) => item.as_name);
                                data = await arrayMapper('Average Upload Latency Loss per as (name) (ms)', labelData, Dataset);
                                break;
                            case 'as_number':
                                labelData = graphData[i][0].map((item) => item.as_number);
                                data = await arrayMapper('Average Upload Latency per as (number) (ms)', labelData, Dataset);
                                break;
                        }
                        break;
                    case 'avg_upload_speed_mbps':
                        Dataset = graphData[i][0].map((item) => item.avg_upload_speed_mbps);
                        switch (group) {
                            case 'month':
                                labelData = graphData[i][0].map((item) => item.month);
                                data = await arrayMapper('Average Upload Speed Loss per month (mbps)', labelData, Dataset);
                                break;
                            case 'region':
                                labelData = graphData[i][0].map((item) => item.region);
                                data = await arrayMapper('Average Upload Speed per region (mbps)', labelData, Dataset);
                                break;
                            case 'city':
                                labelData = graphData[i][0].map((item) => item.city);
                                data = await arrayMapper('Average Upload Speed Loss per city (mbps)', labelData, Dataset);
                                break;
                            case 'as_name':
                                labelData = graphData[i][0].map((item) => item.as_name);
                                data = await arrayMapper('Average Upload Speed Loss per as (name) (mbps)', labelData, Dataset);
                                break;
                            case 'as_number':
                                labelData = graphData[i][0].map((item) => item.as_number);
                                data = await arrayMapper('Average Upload Speed per as (number) (mbps)', labelData, Dataset);
                                break;
                        }
                        break;

                }
                FullData[i] = data;
            }

            
        }
        
        
        return FullData;
    }



    const arrayMapper = async (labelText, labelData, dataSetData) => {
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

export default generateGraphDataMLAB;