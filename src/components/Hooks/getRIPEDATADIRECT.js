import axios from "axios";
//GET RIPE ATLAS DATA FROM THE BACKEND WITH A SPECIFIC QUERY
const getRIPEDATADIRECT=async(command)=>{
    const getData = async()=>{
        try{
            const response = await axios.get(command);
        
            return response.data;
        }catch(error){
            console.log(error);
        }
        
        
    }

    return await getData();
}

export default getRIPEDATADIRECT;