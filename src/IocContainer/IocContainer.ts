import { Container } from "inversify";
import { IUserService } from "../ServiceInterfaces/UserServiceInterface/UserServiceInterface";
import { UserService } from "../Services/UserService/UserService";
import { IUserRepository } from "../RepositoriesInterfaces/UserRepositoryInterface/UserRepositoryInterface";
import { UserRepository } from "../Repositories/UserRepository/UserRepository";
import { Model } from "mongoose";
import { IUserDao } from "../Dao/UserDao/UserDao";
import { UserModel } from "../Models/UserModel/UserModel";
import { IEmailVerificationDao } from "../Dao/EmailVerificationDao/EmailVerificationDao";
import { EmailVerificationModel } from "../Models/EmailVerificationModel/EmailVerificationModel";
import { IMobileVerificationDao } from "../Dao/MobileNumberVerificationDao/MobileVerificationDao";
import { MobileNumberVerificationModel } from "../Models/MobileVerificationModel/MobileVerificationModel";
import { UserController } from "../Controllers/UserController/UserController";


const container = new Container({autoBindInjectable:true});

/*------------------->Model Bindings<-------------------------*/

container.bind<Model<IUserDao>>('User').toConstantValue(UserModel);
container.bind<Model<IEmailVerificationDao>>('EmailVerification').toConstantValue(EmailVerificationModel);
container.bind<Model<IMobileVerificationDao>>('MobileNumberVerification').toConstantValue(MobileNumberVerificationModel);

/*------------------->End Model Bindings<---------------------*/


/*------------------->Service Binding<-------------------------*/

container.bind<IUserService>('IUserService').to(UserService);

/*------------------->End Service Binding<-------------------------*/


/*------------------->Reposotiory Binding<-------------------------*/

container.bind<IUserRepository>('IUserRepository').to(UserRepository);

/*------------------->End Reposotiory Binding<-------------------------*/


/*------------------->Controller Binding<-------------------------*/

container.bind<UserController>(UserController).toSelf();

/*------------------->End Reposotiory Binding<-------------------------*/


export {container};