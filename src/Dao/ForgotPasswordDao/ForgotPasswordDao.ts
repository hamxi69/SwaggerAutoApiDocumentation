export interface IForgotPassowrdDao{
    _id:string;
    OtpCode:string;
    IsActive:boolean;
    IsVerified:boolean;
    CreatedOn:Date;
    UpdatedOn?:Date;
}