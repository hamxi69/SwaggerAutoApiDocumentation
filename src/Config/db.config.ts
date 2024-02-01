import mongoose from "mongoose";
import * as dotenv from "dotenv";

if(process.env.APP_ENV == 'production')
{
    dotenv.config({path:'.env.dev'});
}else{
    dotenv.config({path:'.env.prod'});
}

const uri = `${process.env.MAIN_DB_HOST}/${process.env.MAIN_DB_NAME}`;

const connects = async()=>{
    return mongoose.connect(uri).then(()=>{
        console.log("DATABASE CONNECTION STRING :", uri);
        console.log("CONNECTION TO DATABASE ESTABLISHED");
    }).catch((e)=>{
        console.error('Unable to connect to the database:', e);
        process.exit(1);
    });
}

export {connects};