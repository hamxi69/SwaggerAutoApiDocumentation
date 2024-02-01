import axios from "axios";

const IpAddress = async()=>{
    const response =  await axios.get('https://ipinfo.io/json');
    const data = response.data;
    const publicIP= data.ip;
    return publicIP;
}

export {IpAddress};