import axios from "axios";

const getRIPEDATADIRECT=async(command)=>{
    const getData = async()=>{
        const response = await axios.get(command);
        
        return response.data;
        
    }




    return await getData();
}

export default getRIPEDATADIRECT;