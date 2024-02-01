import { Schema, Model, model  } from "mongoose";
import { Guid } from "guid-typescript";
import moment from "moment";
import { IEmailVerificationDao } from "../../Dao/EmailVerificationDao/EmailVerificationDao";

const EmailVerificationSchema: Schema = new Schema({
    _id :{
        type: String,
        default: () => Guid.create().toString(), 
        required: true,
    },
    UserId:{
        type:String
    },
    EmailVerificationLink:{
        type: String
    },
    CreatedOn:{
        type:Date,
        default: () => moment().toDate(),
    },
    UpdatedOn:{
        type:Date
    },
    IsVerified:{
        type:Boolean,
        default:false
    },
    IsActive:{
        type:Boolean,
        default:true
    }
});

const EmailVerificationModel: Model<IEmailVerificationDao> = model<IEmailVerificationDao>( 
    'EmailVerification',
    EmailVerificationSchema
);

export {EmailVerificationModel};