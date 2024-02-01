import { inject, injectable } from "inversify";
import { IUserService } from "../../ServiceInterfaces/UserServiceInterface/UserServiceInterface";
import { IUserDao, IUserModel } from "../../Dao/UserDao/UserDao";
import { Body, Controller, Delete, Get, Param, Post, Put, QueryParam } from 'routing-controllers';
import { option } from "../../Config/body.config";
import { IForgotPasswordVerification } from "../../Dao/ForgotPasswordDao/ForgotPassowrdVerificationDao/ForgotPasswordVerificationDao";
import { IUserDto } from "../../Dto/UserDto/UserDto";
import { IChangePasswordDao } from "../../Dao/UserDao/ChangePasswordDao/ChangePasswordDao";
@injectable() 
@Controller('User')
export class UserController {

    constructor(@inject('IUserService') private _userService: IUserService) {}

    @Post('/Create')
    async create(@Body(option) user:IUserModel): Promise<{ Data: IUserDto, IsEmailSent: boolean, IsMobileNumerSmsSent: boolean }> {
        const result = await this._userService.create(user);
        return result;
    };

    @Post('/:userId/Mobile-Verification/:otpCode')
    async verificationMobile(@Param('userId') userId:string, @Param('otpCode') otpCode:string){
        return await this._userService.verifyMobileOtpCode(userId, otpCode);
    };

    @Post('/Email-Verification')
    async verificationEmail(@QueryParam('link') link:string)
    {
        return await this._userService.verifyUserEmail(link)
    };

    @Post('/:userId/Re-Sending-Email-Verification')
    async resendVerificationEmail(@Param('userId') userId:string)
    {
        return await this._userService.resendEmailForVerification(userId);
    };

    @Get('/List')
    async getUserList(){
        return await this._userService.getUserList();
    };

    @Get('/:userId')
    async getUserById(@Param('userId') userId:string){
        return await this._userService.UserById(userId);
    };

    @Put('/:userId/Update')
    async updateUser(@Param('userId') userId:string, @Body(option) userModel:IUserDao){
        return await this._userService.updateUser(userId, userModel);
    };

    @Delete('/:userId/Delete')
    async deleteUser(@Param('userId') userId:string){
        return await this._userService.deleteUser(userId);
    };

    @Put('/Change-Passowrd')
    async changePassword(@Body(option) Data:IChangePasswordDao){
        return await this._userService.changePassword(Data);
    };

    @Post('/:email/Forgot-Password-Request')
    async UserForgotRequest(@Param('email') email:string){
        return await this._userService.UserForgotRequest(email);
    };

    @Post('/Forgot-Request-Verification')
    async UserForgotRequestVerification(@Body(option) Model:IForgotPasswordVerification){
        return await this._userService.UserForgotRequestVerification(Model);
    };

    @Put('/Forgot-Password')
    async ForgotPassword(@Body(option) Data:IChangePasswordDao){
        return await this._userService.forgotPassword(Data);
    }
}


