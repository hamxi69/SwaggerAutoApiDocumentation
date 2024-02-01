import twilio from 'twilio';
import { generateOtpCode } from '../Utlis/otp-generator';
import * as dotenv from 'dotenv';

if (process.env.APP_ENV !== 'production') {
    dotenv.config({ path: '.env.dev' }); 
} else {
    dotenv.config({ path: '.env.prod' }); 
} 

const {
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_NUMBER,
    TWILIO_APP_NAME
} = process.env;

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const requestOptpCode = async(MobileNumber:string):Promise<any>=>{
    const randomSixDigitNumber = await generateOtpCode();
    return new Promise((resolve, reject)=>{
        client.messages.create(
            {
                body: `Your ${TWILIO_APP_NAME} Verification code is : ${randomSixDigitNumber} This code will expire in 60 seconds. Don't share this code with anyone; our employess will never ask for the code.`,
                from:TWILIO_NUMBER,
                to:MobileNumber
            }).then(verification=>{
                let data = {sid:verification.sid, status:"pending", dataCreated:verification.dateCreated, otpCode:randomSixDigitNumber};
                resolve(data);
            }).catch(err=>{
                reject(err);
            });
    });
}  

export {requestOptpCode};