
import { extractController } from './src/Utlis/controller-extractor';
import { ControllerInfo } from 'interfaces/ControllerInfo';
import { SwaggerPath } from 'interfaces/ISwagger';
import { PropertyDefinition } from 'interfaces/PropertyInterface';
import * as dotenv from 'dotenv';
import * as glob from 'glob';
import path from 'path';

const generateSwaggerDocument = (): any => {
    let host: string;

    if (process.env.APP_ENV !== 'production') {
        dotenv.config({ path: '.env.dev' });
        host = `${process.env.APP_URL}:${process.env.PORT}`;
    } else {
        dotenv.config({ path: '.env.prod' });
        host = `${process.env.APP_URL}`;
    }

    const controllerFiles = glob.sync('./src/Controllers/**/*.ts', { cwd: __dirname });

    const swaggerPaths: SwaggerPath = {};
    const definitions: any = {};

    controllerFiles.forEach(file => {
        const resolvedPath = path.resolve(__dirname, file);
        const extractedController: ControllerInfo[] = extractController(resolvedPath);

        // Add definitions for BodyModels
        extractedController.forEach(controller => {
            controller.Methods.forEach(method => {
                if (method.Properties && method.Properties.length > 0 && method.BodyModel) {
                    const bodyModelType = method.BodyModel;
                    definitions[bodyModelType] = generateProperties(method.Properties)
                }
            });
        });

        // Add paths to Swagger document
        extractedController.forEach(controller => {
            controller.Methods.forEach(method => {
                const route = method.Route.replace(/'/g, '');
                const controllerName = controller.ControllerName.replace(/'/g, '');
                const cleanedRoute = route.replace(/:([^\/]+)/g, '{$1}');
                const fullPath = `/api/${controllerName}${cleanedRoute}`;
                if (!swaggerPaths[fullPath]) {
                    swaggerPaths[fullPath] = {};
                } 

                swaggerPaths[fullPath][method.Method.toLowerCase()] = {
                    tags: [controller.ControllerName],
                    description: method.BodyModel ? method.BodyModel : undefined,
                    security:[{
                      Bearer:[]
                    }],
                    parameters: method.Params.map((param) => {
                      const parameter :any= {};
                      if (param?.type) {
                        parameter.type = param.type;
                      }

                      if(method?.BodyModel){
                        parameter.name = method.BodyModel; 
                        parameter.description = method.BodyModel;
                        parameter.schema = {
                            $ref:`#/definitions/${method.BodyModel}`
                        }
                      }

                      if(param?.name){
                        parameter.name = param.name;
                      }


                      if(param?.in){
                        parameter.in = param.in;
                      }
                      
                     if(param?.required){
                        parameter.required = param.required;
                     }

                      return parameter;
                    }),
                    responses: {
                      '200': { description: 'Success' },
                      '202': { description: 'No data found' },
                      '500': { description: 'Internal Server Error' },
                      '400': { description: 'Bad Request' },
                      '404': { description: 'Not Found' },
                    },
                  };
                  
            });
        });
    });

    const swaggerDocument = {
        swagger: "2.0",
        info: {
            version: "1.0.0",
            title: "API Drive kar",
        },
        basePath: "/",
        tags: [
            {
                name: "",
                description: "API for Drive Kar",
            },
        ],
        securityDefinitions: {
          Bearer: {
              type: "apiKey",
              name: "token",
              in: "header"
          }
        },
        schemes: ["http", "https"],
        paths: swaggerPaths,
        definitions: definitions,
    };

    return swaggerDocument;
}
type PropertyType = string | PropertyDefinition[];

function generateProperties(bodyModel: { name: string; type: PropertyType; required: boolean }[] | null): any {
    if (!bodyModel) {
        return {};
      }
    
      const result: { [key: string]: any } = {
        required: [],
        properties: {},
      };
    
      bodyModel.forEach((prop) => {
        if (typeof prop.type === 'string') {
          result.properties[prop.name] = {
            type: prop.type,
          };
          if (prop.required) {
            result.required.push(prop.name);
          }
        } else {
          const nestedProperties: { [key: string]: {} } = {};
          (prop.type as PropertyDefinition[]).forEach((nestedProp) => {
            nestedProperties[nestedProp.name] = {
              type: nestedProp.type,
            };
            if (nestedProp.required) {
              result.required.push(`${prop.name}.${nestedProp.name}`);
            }
          });
    
          result.properties[prop.name] = {
            type: 'object',
            properties: {
              ...nestedProperties,
            },
          };
        }
      });
    
      return result;

  }
export { generateSwaggerDocument };
