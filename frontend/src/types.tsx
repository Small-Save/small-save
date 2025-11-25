 
export type User = {
    id: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    email: string;
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



export interface Group {
    id: number;
    name: string;
    target_amount: string;
    size: number;
    duration: number;
    winner_selection_method: string;
    start_date: string;
    created_at: string;
    members: Member[];
}

export interface Member {
    id: string
    username: string
}
export type Contact = {
    name: string;
    phone_number: string;
    email: string;
};
