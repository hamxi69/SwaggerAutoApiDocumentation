import { Guid } from "guid-typescript";
import { Schema, Model, model  } from "mongoose";
import { IMobileVerificationDao } from "../../Dao/MobileNumberVerificationDao/MobileVerificationDao";
import moment from "moment";


const MobileNumberVerificationSchema:Schema = new Schema({
    _id:{
        type:String,
        default:()=>Guid.create().toString(),
        required: true,
    },
    UserId:{
        type:String,
        required:true
    },
    SecurityId:{
        type:String,
        required:true
    },
    EncryptedOtpCode:{
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
        type:Date,
    }
});

const MobileNumberVerificationModel:Model<IMobileVerificationDao> = model<IMobileVerificationDao>(
    'MobileNumberVerification',
    MobileNumberVerificationSchema
);

export {MobileNumberVerificationModel};