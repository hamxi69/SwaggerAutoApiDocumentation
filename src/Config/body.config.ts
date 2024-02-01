import { BodyOptions } from "routing-controllers";

const option:BodyOptions = {
    required:true,
    validate:{
        skipUndefinedProperties:true
    }
}

export {option};