export type User = {
    id: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number: string;
};

export type ValidationResult = {
    isValid: boolean;
    errorText?: string;
};

export type BaseResponse<T> = {
    is_success: boolean;
    data: T | null;
    toast_message: string | null;
    message: string | null;
    error: string | null;
};

export type Contact = {
    id?: string;
    username: string;
    phone_number: string;
    email: string;
};
