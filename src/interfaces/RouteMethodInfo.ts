export interface MethodInfo {
    Method:string;
    Route:string;
    Params: { name?: string; type?: string, required?:boolean, in?:string }[];
    BodyModel?:string;
    Properties?:{ name: string; type: string | { name: string, type: string, required: boolean }[], required:boolean}[];
}