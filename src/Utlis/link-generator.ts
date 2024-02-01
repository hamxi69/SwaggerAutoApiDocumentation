import * as dotenv from 'dotenv';

if (process.env.APP_ENV !== 'production') 
{
    dotenv.config({ path: '.env.dev' }); 
} else {
    dotenv.config({ path: '.env.prod' }); 
}

const Api_Url = process.env.APP_URL;
const EMAIL_CONTROLLER = process.env.EMAIL_VERIFICATON_CONTROLLER;
const PORT = process.env.PORT;
const linkGenerator = async(userId:string,encryptedLink:string):Promise<string>=>{
    return `${Api_Url}:${PORT}/api/${EMAIL_CONTROLLER}/${userId}/Email-Verification/${encryptedLink}`;
};

export{linkGenerator};
