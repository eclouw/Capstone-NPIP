import axios from "axios";

export default function getMLABDATA(country, year, group, metric){
    const data = async()=>{
        const response = await fetchData(
            "https://api-mlab-compute-86452853723.us-central1.run.app/?country=" +
              country +
              "&year=" +
              year +
              "&metric="+metric+"&group_by="+group,
          );
          return response;
    }

    const fetchData=async(command)=>{
        const dataResponse = await axios.post(command);
        return dataResponse.data;
    };

    return data;

}