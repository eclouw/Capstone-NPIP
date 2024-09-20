import axios from "axios";

//MAP DATA INTO A FORMAT THAT CHARTJS CAN READ
const generateGraphDataRIPE = async(graphData, metric, group, between=false) => {
    let data = [];
    let labelData = [];
    let Dataset = [];
    
    

    const generate =  async() => {
        let FullData = [];
        let i = 0;
            
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