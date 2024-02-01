import nodemailer from "nodemailer";
import * as dotenv from "dotenv";


if (process.env.APP_ENV !== 'production') {
    dotenv.config({ path: '.env.dev' }); 
} else {
    dotenv.config({ path: '.env.prod' }); 
}

const {
    APP_EMAIL_SERVICE,
    APP_EMAIL,
    APP_EMAIL_PASSWORD,
    APP_NAME,
} = process.env;

const transporter = nodemailer.createTransport({
    service: APP_EMAIL_SERVICE,
    auth:{
        user:APP_EMAIL,
        pass:APP_EMAIL_PASSWORD
    },
  });


const userEmailVerification = async (userEmail:string, link:string)=>{
    const mailOption = {
        from:APP_EMAIL,
        to:userEmail,
        subject: `${APP_NAME} Email Verification`,
        html:`
        <p>Helo</p>
        <p>Please click the following link to verify your email address for ${APP_NAME}:</p>
        <a href="${link}">${link}</a>
        <p>Thank you!</p>
        `
    }
    const sendEmail = await transporter.sendMail(mailOption);
    return sendEmail;
}


const OneTimePasswordVerification = async (userEmail:string, OtpCode:string)=>{
    const mailOption = 
        {
            from:APP_EMAIL,
            to:userEmail,
            subject: `${APP_NAME} Email Verification`,
            html: `
                <p>Helo</p>
                <p>Please use the following code to verify your email address for ${APP_NAME}:</p>
                <h3>${OtpCode}</h3>
                <p>Thank you!</p>
            ` 
        };
        const sendEmail = await transporter.sendMail(mailOption);
        return sendEmail;
}


export {
    userEmailVerification,
    OneTimePasswordVerification
}
