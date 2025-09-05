type ValidationResult = {
    isValid: boolean;
    errorText?: string;
};

type BaseResponse<T> = {
    is_success: boolean;
    data: T | null;
    toast_message: string | null;
    message: string | null;
    error: string | null;
};
