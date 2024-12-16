const arrayMapper = (labelText, labelData, dataSetData) => {
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

export default arrayMapper();