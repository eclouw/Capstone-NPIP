import axios from "axios";
import { useEffect } from "react";

const getMLABDATA= async(country, year, group, table, between, country2)=>{
    
    
    
    
        const data = async()=>{
            if (country != "all"){
                if (between){
                    const response = await fetchData("https://mlab-13prsouz.uc.gateway.dev/"+table+
                        "?country="+country+","+country2+"&year="+year+"&group_by=country");
                    return response;
                }else{
                    const response = await fetchData("https://mlab-13prsouz.uc.gateway.dev/"+table+
                        "?country="+country+"&year="+year+"&group_by="+group);
                    return response;
                }
                
                
            }else{
                const loadCodes = async()=>{
                    const cachedData = localStorage.getItem('cc');
                    if (cachedData){
                        return JSON.parse(cachedData)
                    }
                }
                const response = await fetchData("https://mlab-13prsouz.uc.gateway.dev/compute/"+
                    "?year="+year+"&group_by="+group);

                localStorage.setItem('cc',JSON.stringify(response))
            
            
            return response;
            }
            
              
        }
    
    
    
    const fetchData=async(command)=>{
        
        
        const dataResponse = await axios.get(command);
        
        return dataResponse.data;
    };
    
    
    
    return await data();

}
export default getMLABDATA;