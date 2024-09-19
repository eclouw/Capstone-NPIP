import axios from "axios";
const getRIPEDATA = async(id, table, measurement, group, year, month) =>{

    const fetchData = async()=>{
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
    }

    return fetchData();
}
//https://ripe-13prsouz.uc.gateway.dev/measurements/?probe_id=1000237&measurement_id=1009&year=2023&month=1
//https://ripe-13prsouz.uc.gateway.dev/compute/?group_by=probe_id&probe_id=1000237
//https://ripe-13prsouz.uc.gateway.dev/compute/?group_by=measurement_id&probe_id=1000237
//https://ripe-13prsouz.uc.gateway.dev/compute/?group_by=measurement_id,%20year&probe_id=1000237
//https://ripe-13prsouz.uc.gateway.dev/compute/?group_by=measurement_id&probe_id=1000237&year=2022
export default getRIPEDATA;