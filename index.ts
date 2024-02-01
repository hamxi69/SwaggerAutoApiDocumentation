import 'reflect-metadata';
import * as dotenv from 'dotenv';
import express from 'express';
import {configureServer} from "./src/Config/server.config"
import {Request,Response} from 'express';
import {loadSwaggerDocument} from "./src/Config/swagger-json.config" 
import { openSwagger } from './src/Utlis/open-swagger';
import mongoose from 'mongoose';

if (process.env.APP_ENV !== 'production') {
    dotenv.config({ path: '.env.dev' }); 
} else {
    dotenv.config({ path: '.env.prod' }); 
} 

console.log('====================== APPLICATION IS RUNNING ON THE ENVIRONMENT OF ================[' + process.env.APP_ENV + ']');

const app = express();

app.use(express.json());

const configuredApp = configureServer(app);

const port = process.env.PORT; 

configuredApp.on('error', onError);

app.use('/swagger', (req:Request,res:Response)=>{
  const swaggerDocument = loadSwaggerDocument();
  res.send(swaggerDocument)
});

app.use(`/${process.env.SWAGGER_APP_NAME}/api-docs`, express.static('public'));

const server = configuredApp.listen(port, () => {
    console.log(`Server is listening at ${process.env.APP_URL}:${port}`);
    openSwagger();
});

app.post('/stop-project', async () => {
  console.log('Stopping the project...');

  await mongoose.disconnect();

  server.close(() => {
    console.log('Project stopped.');
    process.exit();
  });

});

function onError(error: any) {
    if (error.syscall !== 'listen') {
      throw error;
    }
    var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
  
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
};
