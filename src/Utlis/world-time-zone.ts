import axios from "axios";

const worldTimeZone = async (client_ip:string) =>{
    const response = await axios.get(`https://worldtimeapi.org/api/ip/${client_ip}`);
    const data = response.data;
    const dateTime: Date = new Date(data.utc_datetime);
    return dateTime;
}

export {worldTimeZone};