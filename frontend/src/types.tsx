import { BiddingRound } from "pages/Bidding/services";

export type User = {
    id: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number: string;
    profile_pic?: string;
    /** False after OTP until registration completes; true for logged-in accounts. */
    is_registered: boolean;
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

export type WinnerSelectionMethod = "random" | "round_robin" | "bid";

export interface Group {
    id: number;
    name: string;
    target_amount: number;
    size: number;
    duration: number;
    winner_selection_method: WinnerSelectionMethod;
    start_date: string;
    created_at: string;
    members: Member[];
    current_bidding_round: BiddingRound;
    bidding_rounds: BiddingRound[];
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

export type PaymentStatus = "PENDING" | "GIVER_CONFIRMED" | "COMPLETED" | "DUE";

export interface PaymentDetail {
    id: number;
    round_number: number;
    giver: User;
    receiver: User;
    amount: string;
    status: PaymentStatus;
    created_at: string;
}
