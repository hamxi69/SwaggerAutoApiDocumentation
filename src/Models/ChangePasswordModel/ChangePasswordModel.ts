import { Guid } from "guid-typescript";
import { Schema } from "mongoose";

export const ChangePasswordSchema = new Schema({
    _id:{
        type: String,
        default: () => Guid.create().toString(),
        required: true,
    },
    OldPassword:{
        type:String,
        required:true
    },
    UpdatedOn:{
        type:Date,
        default: new Date()
    }
});