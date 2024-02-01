const generateOtpCode= async():Promise<string>=>{
    const digits = '0123456789';
    let OtpCode= '';
    for (let i=0; i<6; i++){
        OtpCode += digits[Math.floor(Math.random() * 10)];
    }
    return OtpCode;
};

export{generateOtpCode};