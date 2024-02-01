import { CorsOptions } from 'cors';
import * as dotenv from 'dotenv';

if (process.env.APP_ENV !== 'production') {
    dotenv.config({ path: '.env.dev' }); 
} else {
    dotenv.config({ path: '.env.prod' }); 
} 

const CorsConfiguration:CorsOptions = {
  origin: process.env.Api_Url,
  methods: 'GET,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

export {CorsConfiguration};