import axios from "axios";
//GET RIPE ATLAS DATA FROM THE BACKEND WITH A SPECIFIC QUERY
const getRIPEDATADIRECT=async(command)=>{
    const getData = async()=>{
        const response = await axios.get(command);
        
        return response.data;
        
    }




    return await getData();
}

export default getRIPEDATADIRECT;