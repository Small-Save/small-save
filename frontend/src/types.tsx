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

export interface Group {
    id: number;
    name: string;
    target_amount: number;
    size: number;
    duration: number;
    winner_selection_method: string;
    start_date: string;
    created_at: string;
    members: Member[];
    latest_bidding_round_id: string;
}

export interface Member {
    id: string;
    username: string;
}

export type Contact = {
    id?: string;
    username: string;
    phone_number: string;
    email: string;
};

export type status = "PENDING" | "GIVER_CONFIRMED" | "COMPLETED" | "DUE";

export type paymentStatus = {
    group_id: number;
    round_id: number;
    payments: payments[];
};

export interface payments {
    id: number;
    giver: string;
    giver_name: string;
    receiver: string;
    receiver_name: string;
    amount: string;
    status: status;
    created_at: string;
}

export interface PaymentDetail {
    group_id: number;
    group_name: string;
    giver_id: string;
    giver_name: string;
    receiver_id: string;
    receiver_name: string;
    amount: number;
    status: "PENDING" | "GIVER_CONFIRMED" | "COMPLETED" | "DUE";
}

export interface Round {
    round_number: number;
    winner: string;
    scheduled_time: string;
}

export interface GroupPaymentHistoryResponse {
    group_name: string;
    rounds: Round[]; // Changed from object to Array
}
