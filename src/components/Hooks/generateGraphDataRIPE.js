const generateGraphDataRIPE = (dataSet)=>{

    const generate=()=>{
        
    }



    const arrayMapper = (labelText, labelData, dataSetData) => {
        const data = {
            labels: labelData,
            datasets: [
                {
                    label: labelText,
                    data: dataSetData,
                    backgroundColor: ["#000"],
                    fill: false,
                    borderColor: "black",
                    borderWidth: 2,
                },
            ],
        };
        console.log("mapped array");
        console.log(data);
        return data;
    };
}