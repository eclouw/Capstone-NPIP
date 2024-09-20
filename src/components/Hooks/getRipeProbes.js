import axios from "axios";
const getRipeProbes = async()=>{

    

    const mapProbes= async(probeData)=>{
        const mappedProbes = ([]);
        for (let i=0; i < probeData.data.length; i++){
            if (probeData.data[i].lat != null && probeData.data[i].lng != null){
                mappedProbes.push({lat: probeData.data[i].lat, lng: probeData.data[i].lng,
                    id: probeData.data[i].id, status: probeData.data[i].status_id, countryCode: probeData.data[i].country_code,
                     supports_v4: probeData.data[i].supports_v4, supports_v6: probeData.data[i].supports_v6,
                    system_type: probeData.data[i].system_type
                })
            }
            
            
        }

        
        return mappedProbes;
    }

        const loadProbes =async()=>{
        const cachedData = localStorage.getItem('probes');
        if (cachedData){
            
            return JSON.parse(cachedData);
        }
        const response = await axios.get('https://ripe-13prsouz.uc.gateway.dev/probes');
        
        const probeData= await mapProbes(response.data);

        localStorage.setItem('probes',JSON.stringify(probeData))

        return probeData;
    
        }


    return await loadProbes();
    
}

export default getRipeProbes;