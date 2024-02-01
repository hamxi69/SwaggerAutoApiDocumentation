import * as HttpStatus from 'http-status-codes';

const customStatus = {
    SUCCESS_100:"100",
    Missing_API_KEY_AUTHORIZATION_IN_HEADER_181:"181",
    INVALID_API_KEY_182:"182",
    FINGERPRINTS_NOT_MATCHED_111:"111",
    INVALID_CITIZEN_NUMBER_112:"112",
    SERVICE_DOWN_113:"113",
    citizen_number_not_verified_114:"114",
    fingerprints_not_available_115:"115",
    invalid_fingerprints_format_116:"116",
    provided_finger_index_not_available_117:"117",
    invalid_finger_index_151:"151",
    empty_fingerprint_152:"152",
    empty_citizen_number_153:"153",
    missing_token_in_header_183:"183",
    invalid_token_184:"184",
    token_expired_185:"185",
    unauthorized_service_186:"186"
}
const HTTP_CONSTANTS= HttpStatus;
export {HTTP_CONSTANTS, customStatus}


