import axios from "axios";
const arrayMapper = async(labelText, labelData, dataSetData) => {
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
    
    
    return data;
};

export default arrayMapper();