export interface IChangePasswordDao{
    UserId:string;
    CurrentPassword?:string;
    Password:string;
    RePassword:string;
}