import { IUserDao } from "../../Dao/UserDao/UserDao";
import { BaseModelEntity } from "../BaseModel/BaseModel";
import { Model, model } from "mongoose";
import { ChangePasswordSchema } from "../ChangePasswordModel/ChangePasswordModel";
import { ForgotPasswordSchema } from "../ForgotPasswordModel/ForgotPasswordModel";

const baseModel = BaseModelEntity.clone();

const UserSchema = baseModel.add({
    FirstName:{
        type:String,
        required:true
    },
    LastName:{
        type:String,
        required:true
    },
    Email:{
        type:String,
        required:true,
        unique:true
    },
    MobileNumber:{
        type:String,
        required:true,
        unique:true,
    },
    CarOwner:{
        type:Boolean,
    },
    Password:{
        type:String,
        required:true,
    },
    IsEmailVerified:{
        type:Boolean,
        default:false
    },
    IsMobileNumberVerified:{
        type:Boolean,
        default:false
    },
    PasswordHistory:[ChangePasswordSchema],
    ForgotPassword:[ForgotPasswordSchema]
});

const UserModel:Model<IUserDao>= model<IUserDao>('User', UserSchema);
export {UserModel};