import { IBaseDao } from "Dao/BaseDao/BaseDao";

export interface IUserModel extends IBaseDao{
    FirstName:string;
    LastName:string;
    Email:string;
    MobileNumber:string;
    CarOwner:boolean;
    Password:string;
};

