import path from 'path';
import * as fs from 'fs';
import { generateSwaggerDocument } from '../../swagger';

export function SwaggerJson(){
    const SwaggerDocument = generateSwaggerDocument();
    const relativePath = '../../swaggers.json';
    const jsonFilePath = path.resolve(__dirname, relativePath);
    
    if (fs.existsSync(jsonFilePath)) {
      const existingContent = fs.readFileSync(jsonFilePath, 'utf-8');
      let existingJson;
      try {

        existingJson = JSON.parse(existingContent);

      } catch (error) {

        console.error('Error parsing existing JSON content:', error);
        
        process.exit(1);
      }

      const updatedJson = { ...existingJson, ...SwaggerDocument };

      fs.writeFileSync(jsonFilePath, JSON.stringify(updatedJson, null, 2));

    } else {
      
      fs.writeFileSync(jsonFilePath, JSON.stringify(SwaggerDocument, null, 2));

    }
    console.log('Swagger JSON file updated or created successfully.');
}

export const loadSwaggerDocument = () => {
  try {
    const relativePath = '../../swaggers.json';
    const jsonFilePath = path.resolve(__dirname, relativePath);
    if (fs.existsSync(jsonFilePath)) {
      const existingContent = fs.readFileSync(jsonFilePath, 'utf-8');
      return JSON.parse(existingContent);
    }else{
      console.error('Swagger JSON file not found');
    }
  } catch (error) {
    console.error('Error loading Swagger documentation:', error);
    return null;
  }
};