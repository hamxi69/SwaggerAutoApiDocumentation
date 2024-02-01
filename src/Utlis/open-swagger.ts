import * as dotenv from 'dotenv';
import { exec } from 'child_process';

if (process.env.APP_ENV !== 'production') {
    dotenv.config({ path: '.env.dev' }); 
} else {
    dotenv.config({ path: '.env.prod' }); 
} 
const isDevelopment =  process.env.APP_ENV === 'development';  

const openSwagger = () => {
  if (isDevelopment) {
      const swaggerUrl = `${process.env.APP_URL}:${process.env.PORT}/${process.env.SWAGGER_APP_NAME}/api-docs`;
      const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

      exec(`"${chromePath}" --new-instance ${swaggerUrl}`, (err, stdout, stderr) => {
          if (err) {
              console.error(err);
              return;
          }
      });
  }
};

export {
    openSwagger
}