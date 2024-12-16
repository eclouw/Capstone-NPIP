import axios from "axios";
//GET MLAB DATA FROM THE BACKEND
const getMLABDATA= async(country, year, group, table, between, country2)=>{

        const data = async()=>{
            if (country != "all"){
                try{
                    if (between){
                        const response = await fetchData("https://mlab-13prsouz.uc.gateway.dev/"+table+
                            "?country="+country+","+country2+"&year="+year+"&group_by=country");
                        return response;
                    }else{
                        const response = await fetchData("https://mlab-13prsouz.uc.gateway.dev/"+table+
                            "?country="+country+"&year="+year+"&group_by="+group);
                        return response;
                    }
                }catch(error){
                console.log("Error fetching data: " + error);
                }
                
                
            }else{
                try{

                const response = await fetchData("https://mlab-13prsouz.uc.gateway.dev/compute/"+
                    "?year="+year+"&group_by="+group);
                    
                return response;
                }catch(error){
                    console.log(error);
                }
            
            
            
            }
            
              
        }
    
    
    
    const fetchData=async(command)=>{
        
        
        const dataResponse = await axios.get(command);
        
        return dataResponse.data;
    };
    
    
    
    return await data();

}
export default getMLABDATA;