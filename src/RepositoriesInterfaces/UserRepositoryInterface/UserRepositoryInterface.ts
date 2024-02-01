import { IForgotPasswordVerification } from "../../Dao/ForgotPasswordDao/ForgotPassowrdVerificationDao/ForgotPasswordVerificationDao";
import { IChangePasswordDao } from "../../Dao/UserDao/ChangePasswordDao/ChangePasswordDao";
import { IUserDao,IUserModel } from "../../Dao/UserDao/UserDao";
import { IUserDto } from "../../Dto/UserDto/UserDto";

export interface IUserRepository{
    create(UserModel:IUserModel):Promise<{Data:IUserDto, IsEmailSent:boolean, IsMobileNumerSmsSent:boolean}>;
    verifyMobileOtpCode(userId:string, OtpCode:string):Promise<{IsVerified?:boolean, RequestTimeOut?:boolean, message: string }>;
    verifyUserEmail(link:string):Promise<{ isAlreadyVerified?: boolean, IsEmailVerified?: boolean, invalidUrl?: boolean, message: string }>;
    resendEmailForVerification(userId:string):Promise<{IsEmailSent:boolean, message?:string}>;
    getUserList():Promise<IUserDto[]>;
    UserById(userId:string):Promise<IUserDto | null>;
    updateUser(userId:string, UserModel:IUserDao):Promise<{Data:IUserDto,IsNewMobileNumber?:boolean, IsNewEmail?:boolean} | null>;
    deleteUser(userId:string):Promise<boolean>;
    changePassword(Data:IChangePasswordDao):Promise<{IsPasswordUpdated:boolean}>;
    UserForgotRequest(userEmail:string):Promise<{Data:IUserDto | boolean}>;
    UserForgotRequestVerification(Model:IForgotPasswordVerification):Promise<{IsUserVerified:boolean, message?:string}>;
    forgotPassword(Data:IChangePasswordDao):Promise<{IsPasswordChanged:boolean}>;
}