import { RoutingControllersOptions, createExpressServer, useContainer } from 'routing-controllers';
import { connects } from './db.config';
import { CorsConfiguration } from './cors.config';
import express from 'express';
import * as glob from 'glob';
import { container } from '../IocContainer/IocContainer';
import { emailSchedulerJob } from '../Jobs/updateEmailVerificationScheduler';
import { SwaggerJson } from './swagger-json.config';



export function configureServer(app: express.Application): express.Application {
    useContainer(container);

    const controllerFiles = glob.sync('../Controllers/**/*.ts', { cwd: __dirname });
    const controllers = controllerFiles.map(file => {
        const controllerClass = require(file);
        return controllerClass[Object.keys(controllerClass)[0]];
    });

    const options:RoutingControllersOptions = {
        cors: CorsConfiguration,
        routePrefix: '/api/',
        controllers: controllers,
        defaultErrorHandler: true,
        validation:true
    };
    const expressServer = createExpressServer(options);
    connects();
    emailSchedulerJob();
    SwaggerJson();
    app.use(expressServer);
    return app;
}
