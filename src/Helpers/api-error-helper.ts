class ApiError extends Error {
    statusCode;
    constructor(message:any,statusCode:any) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode || 500;
        Error.captureStackTrace(this, this.constructor);
    }
};

export{ApiError};