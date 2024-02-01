export interface IMobileVerificationDao{
    _id:string;
    UserId:string;
    SecurityId:string;
    EncryptedOtpCode:string;
    CreatedOn?:Date;
    UpdatedOn?:Date;
    IsVerified?:boolean;
    IsActive?:boolean;
}