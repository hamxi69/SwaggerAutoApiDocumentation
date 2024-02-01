import { Guid } from "guid-typescript";
import { Schema } from "mongoose";
import { IForgotPassowrdDao } from "../../Dao/ForgotPasswordDao/ForgotPasswordDao";
import moment from "moment";

export const ForgotPasswordSchema = new Schema<IForgotPassowrdDao>({
    _id:{
        type: String,
        default: () => Guid.create().toString(),
        required: true,
    },
    OtpCode:{
        type:String,
        required:true
    },
    IsActive:{
        type:Boolean,
        default:true
    },
    IsVerified:{
        type:Boolean,
        default:false
    },
    CreatedOn:{
        type:Date,
        default: () => moment().toDate(),
    },
    UpdatedOn:{
        type:Date
    }
});