import axios from "axios";

//GET RIPE ATLAS DATA FROM THE BACKEND
const getRIPEDATA = async(id, table, measurement, group, year, month) =>{

    const fetchData = async()=>{
        try{
        if (table === 'measurements'){
            if (month != null){
                const response = await axios.get('https://ripe-13prsouz.uc.gateway.dev/measurements?probe_id='+
                    id+'&measurement='+measurement+'&year='+year+'&month='+month)
                    return response.data;
            }else{
                const response = await axios.get('https://ripe-13prsouz.uc.gateway.dev/measurements?probe_id='+
                    id+'&measurement='+measurement+'&year='+year)
                return response.data;
            }
            
        }else if (table=== 'compute'){
            if (month != null){
                const response = await axios.get('https://ripe-13prsouz.uc.gateway.dev/compute?group_by='+group+
                    '&measurement_id='+measurement+'&year='+year+'&month='+month)
                    return response;
            }else{
                const response = await axios.get('https://ripe-13prsouz.uc.gateway.dev/compute?group_by='+group+
                    '&measurement_id='+measurement+'&year='+year);
                    return response;
            }
            
        }
    }catch(error){
        console.log(error);
    }
    
    const data = await fetchData();
    return data();
}
}


export default getRIPEDATA;