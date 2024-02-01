import moment from "moment";
import { inject, injectable } from "inversify";
import { IUserDao, IUserModel } from "../../Dao/UserDao/UserDao";
import { IUserDto } from "../../Dto/UserDto/UserDto";
import { IUserRepository } from "../../RepositoriesInterfaces/UserRepositoryInterface/UserRepositoryInterface";
import { Model } from "mongoose";
import { IEmailVerificationDao } from "../../Dao/EmailVerificationDao/EmailVerificationDao";
import { trimStringProperties } from "../../Helpers/trimString-helper";
import { MESSAGE_CONSTANT } from "../../Constants/message-constant";
import { ApiError } from "../../Helpers/api-error-helper";
import { HTTP_CONSTANTS } from "../../Constants/http-constant";
import { confirmPassword, passwordEncrypt } from "../../Config/bcrypt.config";
import { generateOtpCode } from "../../Utlis/otp-generator";
import { linkGenerator } from "../../Utlis/link-generator";
import { OneTimePasswordVerification, userEmailVerification } from "../../Config/email.config";
import { requestOptpCode } from "../../Config/twilo.config";
import { APP_CONSTANT } from "../../Constants/app-constant";
import { IMobileVerificationDao } from "../../Dao/MobileNumberVerificationDao/MobileVerificationDao";
import { IChangePasswordDao } from "../../Dao/UserDao/ChangePasswordDao/ChangePasswordDao";
import { IForgotPassowrdDao } from "../../Dao/ForgotPasswordDao/ForgotPasswordDao";
import { IForgotPasswordVerification } from "../../Dao/ForgotPasswordDao/ForgotPassowrdVerificationDao/ForgotPasswordVerificationDao";


@injectable()
export class UserRepository implements IUserRepository{
    
    constructor(
        @inject('EmailVerification') private _verificationModel:Model<IEmailVerificationDao>,
        @inject('User') private _userModel:Model<IUserDao>,
        @inject('MobileNumberVerification') private _mobileNumberVerification:Model<IMobileVerificationDao>
    ){}

    async create(UserModel: IUserModel): Promise<{ Data: IUserDto, IsEmailSent: boolean, IsMobileNumerSmsSent:boolean }> {
        const data:IUserDao = await trimStringProperties(UserModel);
        const [emailExsist, numberExsist] = await Promise.all([
            this._userModel.exists({Email:data.Email}).exec(),
            this._userModel.exists({MobileNumber:data.MobileNumber}).exec()
        ]);

        const errorMessages = [];
        if (emailExsist) errorMessages.push(MESSAGE_CONSTANT.SIGNUP.EMAIL_EXIST);
        if (numberExsist) errorMessages.push(MESSAGE_CONSTANT.SIGNUP.NUMBER_EXIST);

        if (errorMessages.length > 0) {
            throw new ApiError(
                errorMessages,
                HTTP_CONSTANTS.StatusCodes.BAD_REQUEST
            );
        }
    
        data.Password = await passwordEncrypt(data.Password);
        data.PasswordHistory = [];
        const user = await this._userModel.create(data);
       if(user.CreatedBy === 'System') await this._userModel.findByIdAndUpdate(user._id, {$set:{CreatedBy:user._id}}); 
        
        let IsEmailSent = false;
        let IsMobileNumerSmsSent=false;

        const [email, number] = await Promise.all([
            this.sendEmailVerificationLink(user._id, user.Email),
            this.requestMobileOtpCode(user.MobileNumber, user._id)
        ]);

        if(email)  IsEmailSent = true;

        if(number) IsMobileNumerSmsSent = true; 

        const Data: IUserDto ={
            UserId: user._id,
            Email: user.Email,
            MobileNumber: user.MobileNumber
        };

        const result : {Data:IUserDto, IsEmailSent:boolean, IsMobileNumerSmsSent:boolean}={
            Data,
            IsEmailSent,
            IsMobileNumerSmsSent
        };

        return result;
    };

    async getUserList():Promise<IUserDto[]>{
        const results = await this._userModel.find({IsDeleted:false}).exec();
        const Users:IUserDto[] = await Promise.all(
            results.map(async (result)=>{
                const User:IUserDto={
                    UserId:result?._id,
                    FirstName:result?.FirstName,
                    LastName:result?.LastName,
                    Email:result?.Email,
                    MobileNumber:result?.MobileNumber,
                    IsEmailVerified:result?.IsEmailVerified,
                    IsMobileNumberVerified:result?.IsMobileNumberVerified,
                    CarOwner:result?.CarOwner
                };
                return User;
            })
        );
        return Users;
    };

    async UserById(userId:string):Promise<IUserDto | null>{
        const result = await this._userModel.findById({_id:userId}).exec();
        if(!result || result.IsDeleted !==false){
            return null; 
        }else{
            const User:IUserDto={
                UserId:result?._id,
                FirstName:result?.FirstName,
                LastName:result?.LastName,
                Email:result?.Email,
                MobileNumber:result?.MobileNumber,
                IsEmailVerified:result?.IsEmailVerified,
                IsMobileNumberVerified:result?.IsMobileNumberVerified,
                CarOwner:result?.CarOwner
            };
            return User;
        }
    };

    async updateUser(userId:string, UserModel:IUserDao):Promise<{Data:IUserDto,IsNewMobileNumber?:boolean, IsNewEmail?:boolean} | null>{
        const exsistUser = await this._userModel.findById({_id:userId}).exec();
    
        if(exsistUser && exsistUser.IsDeleted == false){
            const data = await trimStringProperties(UserModel);
            let IsEmailVerified= exsistUser?.IsEmailVerified;
            let IsMobileNumberVerified = exsistUser?.IsMobileNumberVerified;
            let IsNewMobileNumber=false;
            let IsNewEmail=false;

            if(data.Email != exsistUser.Email){
                const email = await this._userModel.exists({Email:data.Email}).exec();
                if(email){
                    throw new ApiError(
                        MESSAGE_CONSTANT.SIGNUP.EMAIL_EXIST,
                        HTTP_CONSTANTS.StatusCodes.BAD_REQUEST
                    );
                }else{
                    IsEmailVerified = false;
                    IsNewEmail= true;
                }
            }

            if(data.MobileNumber != exsistUser.MobileNumber){
                const number = await this._userModel.exists({MobileNumber:data.MobileNumber}).exec();
                if(number){
                    throw new ApiError(
                        MESSAGE_CONSTANT.SIGNUP.NUMBER_EXIST,
                        HTTP_CONSTANTS.StatusCodes.BAD_REQUEST
                    );
                }else{
                    IsMobileNumberVerified = false;
                    IsNewMobileNumber = true;
                }
            }

            const updateData = {
                FirstName:data?.FirstName,
                LastName:data?.LastName,
                Email:data?.Email,
                MobileNumber:data?.MobileNumber,
                CarOwner:data?.CarOwner,
                IsEmailVerified:IsEmailVerified,
                IsMobileNumberVerified:IsMobileNumberVerified,
            };

            const updatedUser = await this._userModel.findByIdAndUpdate(
                userId,
                updateData,
                {new:true}
            ).exec();

            if(updatedUser){
                const User:IUserDto={
                    UserId:updatedUser._id,
                    FirstName:updatedUser?.FirstName,
                    LastName:updatedUser?.LastName,
                    Email:updatedUser?.Email,
                    MobileNumber:updatedUser?.MobileNumber,
                    IsEmailVerified:updatedUser?.IsEmailVerified,
                    IsMobileNumberVerified:updatedUser?.IsMobileNumberVerified,
                    CarOwner:updatedUser?.CarOwner,
                };

                if(IsNewEmail)  await this.sendEmailVerificationLink(updatedUser._id, updatedUser.Email);
                   
                if(IsNewMobileNumber) await this.requestMobileOtpCode(updatedUser.MobileNumber, updatedUser._id);

                return {Data:User, IsNewEmail:IsNewEmail, IsNewMobileNumber:IsNewMobileNumber};
            }else{
                return null;
            }
        }else{
            throw new ApiError(
                MESSAGE_CONSTANT.RESPONSE.INVALID_ID,
                HTTP_CONSTANTS.StatusCodes.BAD_REQUEST
            );
        }
    };

    async changePassword(Data:IChangePasswordDao):Promise<{IsPasswordUpdated:boolean}>{
        const user = await this._userModel.findById({_id:Data.UserId}).exec();
        if(user && user.IsDeleted == false && Data.CurrentPassword){
            const checkCurrentPassword = await confirmPassword(Data.CurrentPassword, user.Password);
            if(checkCurrentPassword){
                if (user.PasswordHistory && user.PasswordHistory.length > 0) { 
                    
                    const sortedPasswords= user.PasswordHistory.sort((a,b)=>{
                        return b.UpdatedOn.getTime() - a.UpdatedOn.getTime();
                    });
                    
                    const lastTenPasswords = sortedPasswords.slice(-10);

                    let matchPassowrdEntry = null;
                    
                    for(const passwordEntry of lastTenPasswords){
                        if(await confirmPassword(Data.Password, passwordEntry.OldPassword)){
                            matchPassowrdEntry = passwordEntry;
                            break;
                        }
                    }

                    if(matchPassowrdEntry){
                        const mostRecentUpdate = matchPassowrdEntry.UpdatedOn.getTime();
                        const timeDifferenceDays = Math.floor((new Date().getTime() - mostRecentUpdate) / (1000 * 60 * 60 * 24));
                        let errorMessages = '';
                        if(timeDifferenceDays > 30){
                            const timeDifferenceInMonths = Math.floor(timeDifferenceDays / 30);
                            errorMessages = `Error: Password Update Failed! This password was used ${timeDifferenceInMonths} months ago. For security reasons, please choose a password that hasn't been used recently.`;
                            throw new ApiError(
                                errorMessages,
                                HTTP_CONSTANTS.StatusCodes.BAD_REQUEST
                            );
                        }else{
                            errorMessages = `Error: Password Update Failed! This password was used ${timeDifferenceDays} days ago. For security reasons, please choose a password that hasn't been used recently.`;
                            throw new ApiError(
                                errorMessages,
                                HTTP_CONSTANTS.StatusCodes.BAD_REQUEST
                            );
                        }
                    }
                }
                
                Data.Password = await passwordEncrypt(Data.Password);
                const changedUserPassword= await this._userModel.findByIdAndUpdate(
                    Data.UserId,
                    {
                        Password:Data.Password,
                        UpdatedOn:new Date(),
                        UpdatedBy: user._id,
                        $push:{
                            PasswordHistory:[{
                                OldPassword:user.Password
                            }]
                        }
                    },
                    {new:true}
                ).exec();
                if(changedUserPassword) {
                    return {IsPasswordUpdated:true}
                }else{
                    return {IsPasswordUpdated:false}
                }
            }else{
                throw new ApiError(
                    MESSAGE_CONSTANT.RESPONSE.CURRENT_PASSWORD_ERROR,
                    HTTP_CONSTANTS.StatusCodes.BAD_REQUEST
                );
            }
        }else{
            throw new ApiError(
                MESSAGE_CONSTANT.RESPONSE.INVALID_ID,
                HTTP_CONSTANTS.StatusCodes.BAD_REQUEST
            );
        }
    };

    async UserForgotRequest(userEmail:string):Promise<{Data:IUserDto | boolean}>{
        const result = await this._userModel.findOne({Email:userEmail}).exec();
        if(result && result.IsDeleted == false){
            const OTP_CODE = await generateOtpCode();
            const requestForgotPasswordCheck = await OneTimePasswordVerification(result.Email, OTP_CODE);
            if(requestForgotPasswordCheck){
                const userCheck = await this._userModel.findByIdAndUpdate(
                    result._id,
                    {
                        $push:{
                        ForgotPassword:[{
                            OtpCode:OTP_CODE
                        }]
                      }
                    },
                    {new:true}
                )
                .exec();
                if(userCheck){
                    if(userCheck.ForgotPassword && userCheck.ForgotPassword.length > 0 ){
                        const mostRecent = userCheck.ForgotPassword.slice().sort((a, b) => {
                            return b.CreatedOn.getTime() - a.CreatedOn.getTime();
                          })[0];
                        this.deactivateOTP(mostRecent._id, true, userCheck._id);
                    }
                    const user :IUserDto={
                        UserId: userCheck._id,
                        Email: userCheck.Email,
                        MobileNumber: userCheck.MobileNumber
                    };
                    return {Data:user};
                }else{
                    return {Data:false}
                }
            }else{
                throw new ApiError(
                    MESSAGE_CONSTANT.RESPONSE.INVALID_EMAIL,
                    HTTP_CONSTANTS.StatusCodes.BAD_REQUEST
                    );
            }
        }else{
            throw new ApiError(
                MESSAGE_CONSTANT.RESPONSE.INVALID_EMAIL,
                HTTP_CONSTANTS.StatusCodes.BAD_REQUEST
                );
        }
    };

    async UserForgotRequestVerification(Model:IForgotPasswordVerification):Promise<{IsUserVerified:boolean, message?:string}>{
        const result = await this._userModel.findById(Model.UserId).exec();
        if(result && result.ForgotPassword && result.IsDeleted == false ){
            const mostrecent = result.ForgotPassword.slice().sort((a, b)=>{
                return b.CreatedOn.getTime() - a.CreatedOn.getTime();
            })[0];
            if(mostrecent.IsActive){
                const currentTime = moment();
                const otpCreationTime = moment(mostrecent.CreatedOn);
                const timeDifferenceInMilliseconds = currentTime.diff(otpCreationTime);
                const timeDifferenceInSeconds = Math.floor(timeDifferenceInMilliseconds / 1000);
                if(timeDifferenceInSeconds <=60){
                    if(mostrecent.OtpCode === Model.OtpCode){
                        mostrecent.IsActive=false;
                        mostrecent.IsVerified=true;
                        mostrecent.UpdatedOn = new Date();
                        await result.save();
                        return {IsUserVerified:true};
                    }else{
                        return {IsUserVerified:false, message:MESSAGE_CONSTANT.RESPONSE.INVALID_INPUT_OTP};
                    }
                }else{
                    mostrecent.IsActive = false;
                    await result.save();
                    return {IsUserVerified:false, message:MESSAGE_CONSTANT.RESPONSE.REQUEST_TIME_OUT};
                }
            }else{
                return {IsUserVerified:false, message:MESSAGE_CONSTANT.RESPONSE.REQUEST_TIME_OUT};
            } 
        }else{
            throw new ApiError(
                MESSAGE_CONSTANT.RESPONSE.INVALID_ID,
                HTTP_CONSTANTS.StatusCodes.BAD_REQUEST
            )
        }
    };

    async forgotPassword(Data:IChangePasswordDao):Promise<{IsPasswordChanged:boolean}>{
        const user = await this._userModel.findById(Data.UserId).exec();
        if(user && user.IsDeleted == false){
            if (user.PasswordHistory && user.PasswordHistory.length > 0) { 
                    
                    const sortedPasswords= user.PasswordHistory.sort((a,b)=>{
                        return b.UpdatedOn.getTime() - a.UpdatedOn.getTime();
                    });
                    
                    const lastTenPasswords = sortedPasswords.slice(-10);

                    let matchPassowrdEntry = null;
                    
                    for(const passwordEntry of lastTenPasswords){
                        if(await confirmPassword(Data.Password, passwordEntry.OldPassword)){
                            matchPassowrdEntry = passwordEntry;
                            break;
                        }
                    }

                    if(matchPassowrdEntry){
                        const mostRecentUpdate = matchPassowrdEntry.UpdatedOn.getTime();
                        const timeDifferenceDays = Math.floor((new Date().getTime() - mostRecentUpdate) / (1000 * 60 * 60 * 24));
                        let errorMessages = '';
                        if(timeDifferenceDays > 30){
                            const timeDifferenceInMonths = Math.floor(timeDifferenceDays / 30);
                            errorMessages = `Error: Password Update Failed! This password was used ${timeDifferenceInMonths} months ago. For security reasons, please choose a password that hasn't been used recently.`;
                            throw new ApiError(
                                errorMessages,
                                HTTP_CONSTANTS.StatusCodes.BAD_REQUEST
                            );
                        }else{
                            errorMessages = `Error: Password Update Failed! This password was used ${timeDifferenceDays} days ago. For security reasons, please choose a password that hasn't been used recently.`;
                            throw new ApiError(
                                errorMessages,
                                HTTP_CONSTANTS.StatusCodes.BAD_REQUEST
                            );
                        }
                    }
                }
                Data.Password = await passwordEncrypt(Data.Password);
                const changedUserPassword= await this._userModel.findByIdAndUpdate(
                    Data.UserId,
                    {
                        Password:Data.Password,
                        UpdatedOn:new Date(),
                        UpdatedBy: user._id,
                        $push:{
                            PasswordHistory:[{
                                OldPassword:user.Password
                            }]
                        }
                    },
                    {new:true}
                ).exec();
                if(changedUserPassword) {
                    return {IsPasswordChanged:true}
                }else{
                    return {IsPasswordChanged:false}
                }
            
        }else{
            throw new ApiError(
                MESSAGE_CONSTANT.RESPONSE.INVALID_ID,
                HTTP_CONSTANTS.StatusCodes.BAD_REQUEST
            );
        }
    }

    async deleteUser(userId:string):Promise<boolean>{
        const result = await this._userModel.findByIdAndUpdate(
            userId,
            {
                IsDeleted:true
            },
            {new:true}
        ).exec();
        if(result) return true;
        else return false;
    };

    async verifyMobileOtpCode(userId:string, OtpCode:string):Promise<{IsVerified?:boolean, RequestTimeOut?:boolean, message: string }>{
        const result = await this._mobileNumberVerification
        .findOne({
            UserId: userId,
        })
        .sort({ CreatedOn: -1 }) 
        .exec();
        if(result)
        {
            const currentTime = moment();
            const otpCreationTime = moment(result.CreatedOn);
            const timeDifferenceInMilliseconds = currentTime.diff(otpCreationTime);
            const timeDifferenceInSeconds = Math.floor(timeDifferenceInMilliseconds / 1000);
            if(timeDifferenceInSeconds <=60)
            {   
                const twilio = await confirmPassword(OtpCode, result.EncryptedOtpCode) ? APP_CONSTANT.TWILIO.APPROVED : APP_CONSTANT.TWILIO.REJECTED;;
                if(twilio === APP_CONSTANT.TWILIO.APPROVED)
                {
                    await Promise.all([
                        this._mobileNumberVerification.findByIdAndUpdate(
                            result._id,
                            {
                                $set: {
                                    IsActive: false,
                                    IsVerified: true,
                                    UpdatedOn:new Date(),
                                },
                            },
                            { new: true } 
                        ),                       
                        this._userModel.findByIdAndUpdate(result.UserId, {$set:{IsMobileNumberVerified:true}})
                    ]);
                    return {IsVerified:true, message:MESSAGE_CONSTANT.RESPONSE.MOBILE_NUMBER_VERIFIED};
                }else{
                    await this._mobileNumberVerification.findByIdAndUpdate(result._id, { $set: { ActiveOTP: false } });    
                    return {IsVerified:false, message:MESSAGE_CONSTANT.RESPONSE.INVALID_INPUT_OTP};
                }
            }else{
                    await this._mobileNumberVerification.findByIdAndUpdate(result._id, { $set: { ActiveOTP: false } });    
                    return {RequestTimeOut:true, message:MESSAGE_CONSTANT.RESPONSE.REQUEST_TIME_OUT};
            }
        }else{
            return {IsVerified:false, message:MESSAGE_CONSTANT.RESPONSE.INVALID_ID};
        }
    };

    async verifyUserEmail(link: string): Promise<{ isAlreadyVerified?: boolean, IsEmailVerified?: boolean, invalidUrl?: boolean, message: string }> {
        const url = new URL(link);
        const pathNameParts = url.pathname.split('/').filter(Boolean);
      
        if (pathNameParts[0] === 'api' && pathNameParts[1] === 'User' && pathNameParts[3] === 'Email-Verification') {
          const Id = pathNameParts[2];
          
          const result = await this._verificationModel.findOne({
            UserId: Id,
          }).sort({ CreatedOn: -1 }).exec();
      
          if (result) {
            if (result.IsActive) {
              if (result.IsVerified) {
                return { isAlreadyVerified: true, message: MESSAGE_CONSTANT.RESPONSE.EMAIL_ALREADY_VERIFIED };
              } else {
                if(result.EmailVerificationLink == link ){
                    await Promise.all([
                        this._verificationModel.findByIdAndUpdate(
                          result._id, 
                          { 
                              $set: {
                                   IsVerified: true, 
                                   UpdatedOn:new Date() 
                              }, 
                          },
                            { new: true } 
                          ),
                        this._userModel.findByIdAndUpdate(result.UserId, { $set: { IsEmailVerified: true } })
                      ]);
                      return { IsEmailVerified: true, message: MESSAGE_CONSTANT.RESPONSE.EMAIL_VERIFIED };
                }else{
                    return { IsEmailVerified: false, message: MESSAGE_CONSTANT.RESPONSE.INVALID_LINK };
                }
              }
            } else {
                if(result.IsVerified)
                {
                    return { isAlreadyVerified: true, message: MESSAGE_CONSTANT.RESPONSE.EMAIL_ALREADY_VERIFIED };
                }else{
                    return { IsEmailVerified: false, message: MESSAGE_CONSTANT.RESPONSE.LINK_EXPIRED };
                }
            }
          } else {
            throw new ApiError(MESSAGE_CONSTANT.RESPONSE.INVALID_LINK,
                HTTP_CONSTANTS.StatusCodes.BAD_REQUEST);
          }
        } else {
            throw new ApiError(MESSAGE_CONSTANT.RESPONSE.INVALID_LINK,
                HTTP_CONSTANTS.StatusCodes.BAD_REQUEST);
        }
    };
      
    async resendEmailForVerification(userId:string):Promise<{IsEmailSent:boolean, message?:string}>
    {
        const user = await this._userModel.findById({_id:userId}).exec();
        if(user) {
            if(user.IsEmailVerified==true){
                return {IsEmailSent:false, message:MESSAGE_CONSTANT.RESPONSE.EMAIL_ALREADY_VERIFIED};
            } else {
             const sendEmail = await this.sendEmailVerificationLink(userId, user.Email);  
             if(sendEmail){
                return {IsEmailSent:true};
            }else{
                return {IsEmailSent:false};
            }
        }
        }else{
            throw new ApiError(MESSAGE_CONSTANT.RESPONSE.INVALID_ID,HTTP_CONSTANTS.StatusCodes.BAD_REQUEST);
        }
    };

    private async sendEmailVerificationLink(userId:string, userEmail:string):Promise<boolean>{
        const otpCode = await generateOtpCode();
        const encrypetedLink = await passwordEncrypt(otpCode);
        const emailLink = await linkGenerator(userId, encrypetedLink);
        const sendEmail = await userEmailVerification(userEmail, emailLink);
        if(sendEmail)
        {
            const emailVerificationDao={
                UserId:userId,
                EmailVerificationLink:emailLink,
                UpdatedOn:null
            };
            await this._verificationModel.create(emailVerificationDao);
            return true;
        }
        return false;   
    };

    private async requestMobileOtpCode(mobileNumber:string,userId:string):Promise<boolean>{
        const twilio = await requestOptpCode(mobileNumber);
        if(twilio.status === APP_CONSTANT.TWILIO.PENDING){
            const encryptOtpCode = await passwordEncrypt(twilio.otpCode);
            const mobileVerificationDao={
                UserId:userId,
                EncryptedOtpCode:encryptOtpCode,
                SecurityId:twilio.sid,
                UpdatedOn:null
            };
            const OTP = await this._mobileNumberVerification.create(mobileVerificationDao);
            await this.deactivateOTP(OTP._id)
            return true;
        }else{
            return false;
        }
    };

    private async deactivateOTP(OtpId:string, IsForgotPassword?:boolean, userId?:string) {
        try {
            if(IsForgotPassword && userId){
                setTimeout(async () => {
                    const user = await this._userModel.findById(userId).exec();
                  if(user?.ForgotPassword){
                    const forgotPasswordIndex = user?.ForgotPassword?.findIndex(
                        (forgot)=> forgot._id === OtpId
                    );
                    if(forgotPasswordIndex !==-1){
                        const Id = user?.ForgotPassword[forgotPasswordIndex]?._id;
                        const CreatedOn = user?.ForgotPassword[forgotPasswordIndex]?.CreatedOn;
                        const IsVerified = user?.ForgotPassword[forgotPasswordIndex]?.IsVerified;
                        const OtpCOde = user?.ForgotPassword[forgotPasswordIndex]?.OtpCode; 
                        const updatedForgotEntity:IForgotPassowrdDao = {
                            _id:Id,
                            CreatedOn: CreatedOn,
                            OtpCode: OtpCOde,
                            IsActive: false,
                            IsVerified:IsVerified,
                        };
                        const updatedForgotPassword={
                            ...user.ForgotPassword[forgotPasswordIndex],
                            ...updatedForgotEntity
                        }
                        user.ForgotPassword[forgotPasswordIndex]= updatedForgotPassword;
                        await user.save();
                    }
                  }else {
                    console.log('User or ForgotPassword array is null or undefined.');
                }
                  }, 60000);
            }else{
                setTimeout(async () => {
                    await this._mobileNumberVerification.findByIdAndUpdate(OtpId, { $set: { IsActive: false } });
                  }, 60000);
            }
        } catch (error) {
          console.log("Error occurred while deactivating OTP:", error);
        }
    };
    

}


