export interface SwaggerPath {
    [key: string]: {
        [key: string]: {
            tags: string[];
            description?: string,
            summary?: string;
            security?:[{
                Bearer: []
            }],
            parameters: {
                name?: string;
                in?: string;
                required?: boolean;
                type?:string;
                description?: string;
                schema?:{
                    $ref:any;
                }
            }[];
            responses:any
        };
    };
}