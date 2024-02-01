import bcrypt from "bcryptjs";

const passwordEncrypt = async(password:string):Promise<string>=>{
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    return hashPassword;
};

const confirmPassword = async(plainTextPassword:string, hashedPassword:string):Promise<boolean>=>{
    return await bcrypt.compare(plainTextPassword, hashedPassword);
}

export {
    passwordEncrypt,
    confirmPassword
}