const MESSAGE_CONSTANT = {
    SIGNUP: {
        SUCCESS: "You have successfully signed up.",
        ERROR: "Error occurred please contact your web administrator",
        EMAIL_EXIST: "Email already exists.",
        NUMBER_EXIST: "Numner already exists.",
        USER_NAME_EXIST: "User name already exists",
    },
    LOGIN: {
        SUCCESS: "You have successfully logged in.",
        NO_ACC: "Invalid credentials.",
        AUTH_FAILED: "User Authentication Failed!",
        INACTIVE: "Your account is deactivated, contact your web administrator.",
        INVALID_TOKEN: "Invalid Token!",
        ALREADY_LOGGED_IN: "You are already loggedin. Logout from other devices to continue logging in.",
        FORGET_PASSWORD_EMAIL: "Your request has send to administrator. Please wait you will get email with new credentials",
        PASSWORD_EXPIRED: "Your Password is Expired. Please Check your email and change your Password.",
        PASSWORD_ALREADY_USED: "You used an old password. To protect your account choose a new password",
        NO_DATA_FOUND: "USER NOT FOUND"
    },
    RESPONSE: {
        NO_DATA_FOUND: "No data exists.",
        EMAIL_VERIFIED:"Congratulation You're email is verified.",
        MOBILE_NUMBER_VERIFIED:"Mobile Number is verified.",
        EMAIL_ALREADY_VERIFIED:"You're email is already verified",
        REQUEST_TIME_OUT:"You're OTP Code is expired. Please Request New One",
        DATA_INSERTED: "Data inserted.",
        DATA_UPDATED: "Data updated.",
        DATA_DELETED: "Data deleted.",
        DATA_DELETE_ERROR: "Unable to delete",
        DATA_INSERT_ERROR: "Unable to insert",
        DATA_UPDATE_ERROR: "Unable to update",
        DATA_FETCHED: "Data fetched.",
        ALREADY_EXIST: "User already exists with this username.",
        BAD_REQUEST: "Bad Request!",
        SERVER_ERROR: "Internal server error!",
        UNAUTHORIZED: "Unauthorized request!",
        ALREADY_LOGGED_IN: "User is already logged in other system",
        SESSION_LOGOUT: "All sessions logout  successfully",
        EMAIL_NOT_SENT: "Email could not be sent",
        EMAIL_SENT: "Email has been sent successfully",
        USER_INACTIVE: "User In Active! Please contact your Administrator",
        PERMISSION_DENIED: "You're not allowed to perform this action, Refresh the window to see new permissions",
        CREDENTIALS_NOT_PRESENT: "User Name or Password is not Present!",
        LINK_EXPIRED: "Your link has been expired please try again",
        ACTIVE_LINK: 'Link is active',
        USER_DELETED: "User Deleted.",
        TOKEN_MISSING: 'Token missing',
        USER_DELETE_ERROR: "Unable to Delete User",
        INVALID_INPUT_OTP:'Invalid OTP Code. Please Request New One.',
        INVALID_ID:'Invalid Id.',
        INVALID_LINK: 'Invalid Link',
        CURRENT_PASSWORD_ERROR:"You're current passowrd is not matched.",
        INVALID_EMAIL:"You're email is not valid."
    },

    GENERAL: {
        FIELDS_REQUIRED: "Input fields are missing or invalid, please provide the correct required fields.",
        INTERNAL_SERVER_ERROR:"Internal Server Error"
    },
}

export {
    MESSAGE_CONSTANT
}