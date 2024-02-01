export interface IUserDto{
    UserId:string;
    FirstName?:string;
    LastName?:string;
    Email:string;
    MobileNumber:string;
    IsMobileNumberVerified?:boolean;
    IsEmailVerified?:boolean;
    CarOwner?:boolean;
}