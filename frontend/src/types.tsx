type ValidationResult = {
    isValid: boolean;
    errorText?: string;
};

type response = {
    is_success: boolean;
    data: null | object;
    toast_message: null | string;
    message: null | string;
    error: null | string;
    status: number;
};