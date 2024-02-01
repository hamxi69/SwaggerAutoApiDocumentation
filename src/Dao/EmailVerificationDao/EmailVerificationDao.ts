export interface IEmailVerificationDao {
    _id:string;
    UserId:String
    EmailVerificationLink:string;
    CreatedOn?:Date;
    UpdatedOn?:Date;
    IsVerified?:boolean;
    IsActive?:boolean;
}