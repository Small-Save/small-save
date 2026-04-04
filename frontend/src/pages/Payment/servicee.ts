import api from "lib/axios";
import URLS from "lib/constants";
import type { BaseResponse, PaymentDetail } from "types";


export const confirmGiverPayment = async (paymentId: number): Promise<BaseResponse<{ message: string }>> => {
    try {
        const response = await api.post(URLS.PAYMENTS.GIVER_CONFIRM(paymentId), {});
        return response.data;
    } catch (error) {
        console.error("Error confirming giver payment:", error);
        throw error;
    }
};

export const confirmReceiverPayment = async (paymentId: number): Promise<BaseResponse<{ message: string }>> => {
    try {
        const response = await api.post(URLS.PAYMENTS.RECEIVER_CONFIRM(paymentId), {});
        return response.data;
    } catch (error) {
        console.error("Error confirming receiver payment:", error);
        throw error;
    }
};

export const getGroupPayments = async (groupId: number): Promise<BaseResponse<PaymentDetail[]>> => {
    try {
        const response = await api.get(URLS.PAYMENTS.GROUP_ALL(groupId));
        return response.data;
    } catch (error) {
        console.error(`Error fetching details for payment ${groupId}:`, error);
        throw error;
    }
};

export const getRoundPayments = async (roundId: number | null): Promise<BaseResponse<PaymentDetail[]>> => {
    try {
        if (!roundId) {
            throw new Error("Round ID is required");
        }
        const response = await api.get(URLS.PAYMENTS.ROUND_PAYMENTS(roundId));
        return response.data;
    } catch (error) {
        console.error(`Error fetching details for payment ${roundId}:`, error);
        throw error;
    }
};
