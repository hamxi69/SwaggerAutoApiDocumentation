import { IBaseDao } from "../BaseDao/BaseDao";
import { IForgotPassowrdDao } from "../ForgotPasswordDao/ForgotPasswordDao";
import { IOldPasswordDao } from "../Password/OldPassordDao";

export interface IUserDao extends IBaseDao{
    FirstName:string;
    LastName:string;
    Email:string;
    MobileNumber:string;
    CarOwner:boolean;
    Password:string;
    IsEmailVerified:boolean;
    IsMobileNumberVerified:boolean;
    PasswordHistory?:IOldPasswordDao[];
    ForgotPassword?:IForgotPassowrdDao[];
};


export interface IUserModel extends IBaseDao{
    FirstName:string;
    LastName:string;
    Email:string;
    MobileNumber:string;
    CarOwner:boolean;
    Password:string;
}   

