import axios from "axios";
import { useEffect } from "react";

const getMLABDATA= async(country, year, group, table)=>{
    
    console.log('called function to get Data')
    console.log(country)
    const data = async()=>{
        if (country != "all"){
            const response = await fetchData("https://mlab-13prsouz.uc.gateway.dev/"+table+
                "?country="+country+"&year="+year+"&group_by="+group);
            return response;
            
        }else{
            const response = await fetchData("https://mlab-13prsouz.uc.gateway.dev/compute/"+
                "?year="+year+"&group_by="+group);
        console.log('data response');
        console.log(response.data);
        return response;
        }
        
          
    }

    const fetchData=async(command)=>{
        console.log('fetching data')
        console.log(command);
        const dataResponse = await axios.get(command);
        
        return dataResponse.data;
    };
    
    
    console.log('re')
    return await data();

}
export default getMLABDATA;