const generateProbeRequest = (atrributes, id)=>{
    const attributes = atrributes;
    let request='https://ripe-13prsouz.uc.gateway.dev/compute?/probe_id='+id;
    const genReq=()=>{
        for (let i =0; i< attributes.length;i++){
            console.log(attributes);
            switch (attributes[i][0].key){
                case 'group':
                    request = request+ '&group_by='+atrributes[i][0].value;
                break;
                case 'year':
                    request = request+ '&year='+atrributes[i][0].value;
                break;
                case 'month':
                    request = request+ '&month='+atrributes[i][0].value;
                break;
                case 'measurement':
                    request = request+ '&measurement_id='+atrributes[i][0].value;
                break;
            }
        }
        return request;
    }

    return genReq();
}
export default generateProbeRequest;