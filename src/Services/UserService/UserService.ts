import { inject, injectable } from "inversify";
import { IUserDao, IUserModel } from "../../Dao/UserDao/UserDao";
import { IUserDto } from "../../Dto/UserDto/UserDto";
import { IUserService } from "../../ServiceInterfaces/UserServiceInterface/UserServiceInterface";
import { IUserRepository } from "../../RepositoriesInterfaces/UserRepositoryInterface/UserRepositoryInterface";
import { IChangePasswordDao } from "../../Dao/UserDao/ChangePasswordDao/ChangePasswordDao";
import { IForgotPasswordVerification } from "../../Dao/ForgotPasswordDao/ForgotPassowrdVerificationDao/ForgotPasswordVerificationDao";

@injectable()
export class UserService implements IUserService{

    constructor(@inject('IUserRepository') private _userRepository:IUserRepository){}

    async create(Model: IUserModel): Promise<{ Data: IUserDto; IsEmailSent: boolean; IsMobileNumerSmsSent: boolean; }> {
        const result = await this._userRepository.create(Model);
        return result;
    };

    async verifyMobileOtpCode(userId: string, OtpCode: string): Promise<{ IsVerified?: boolean ,RequestTimeOut?: boolean , message: string; }> {
        const result = await this._userRepository.verifyMobileOtpCode(userId,OtpCode);
        return result;
    };

    async verifyUserEmail(link: string): Promise<{ isAlreadyVerified?: boolean ,IsEmailVerified?: boolean , invalidUrl?: boolean , message: string; }> {
        const result = await this._userRepository.verifyUserEmail(link);
        return result;
    };

    async resendEmailForVerification(userId: string): Promise<{ IsEmailSent: boolean; message?: string | undefined; }> {
        const result = await this._userRepository.resendEmailForVerification(userId);
        return result;
    };

    async getUserList(): Promise<IUserDto[]> {
        const result = await this._userRepository.getUserList();
        return result;
    };

    async UserById(userId: string): Promise<IUserDto | null> {
        const result = await this._userRepository.UserById(userId);
        return result;
    };

    async updateUser(userId: string, UserModel: IUserDao): Promise<{ Data: IUserDto; IsNewMobileNumber?: boolean | undefined; IsNewEmail?: boolean | undefined; } | null> {
        const result = await this._userRepository.updateUser(userId, UserModel);
        return result;
    };

    async deleteUser(userId: string): Promise<boolean> {
        const result = await this._userRepository.deleteUser(userId);
        return result;
    };
 
    async changePassword(Data: IChangePasswordDao): Promise<{ IsPasswordUpdated: boolean}> {
        const result = await this._userRepository.changePassword(Data);
        return result;
    };

    async UserForgotRequest(userEmail: string): Promise<{ Data: boolean | IUserDto; }> {
        const result = await this._userRepository.UserForgotRequest(userEmail);
        return result;
    };

    async UserForgotRequestVerification(Model: IForgotPasswordVerification): Promise<{ IsUserVerified: boolean; message?: string | undefined; }> {
        const result = await this._userRepository.UserForgotRequestVerification(Model);
        return result;
    };

    async forgotPassword(Data: IChangePasswordDao): Promise<{ IsPasswordChanged: boolean; }> {
        const result = await this._userRepository.forgotPassword(Data);
        return result;
    }
}