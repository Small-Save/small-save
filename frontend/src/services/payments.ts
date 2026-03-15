import api from "lib/axios";
import URLS from "lib/constants";
import type { BaseResponse,paymentStatus, GroupPaymentHistoryResponse, PaymentDetail } from "types";


export const fetchCurrentPaymentStatus = async (groupId: number, round_id: number): Promise<BaseResponse<paymentStatus>> => {
  try {
    const response = await api.get(`${URLS.PAYMENTS.CURRENT_PAYMENT_STATUS}/group/${groupId}/round/${round_id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching current payment status:", error);
    throw error;
  }
};


export const confirmGiverPayment = async (paymentId: number | string): Promise<BaseResponse<{ message: string }>> => {
  try {
    const response = await api.post(URLS.PAYMENTS.GIVER_CONFIRM(paymentId), {});
    return response.data;
  } catch (error) {
    console.error("Error confirming giver payment:", error);
    throw error;
  }
};

export const confirmReceiverPayment = async (paymentId: number | string): Promise<BaseResponse<{ message: string }>> => {
  try {
    const response = await api.post(URLS.PAYMENTS.RECEIVER_CONFIRM(paymentId), {});
    return response.data;
  } catch (error) {
    console.error("Error confirming receiver payment:", error);
    throw error;
  }
};


export const getPaymentDetails = async (paymentId: number | string): Promise<BaseResponse<PaymentDetail>> => {
  try {
    const response = await api.get(URLS.PAYMENTS.DETAILS(paymentId));
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for payment ${paymentId}:`, error);
    throw error;
  }
};


export const fetchGroupPaymentHistory = async (
  groupId: number | string
): Promise<BaseResponse<GroupPaymentHistoryResponse>> => {
  try {
    const response = await api.get(URLS.PAYMENTS.HISTORY(groupId));
    return response.data;
  } catch (error) {
    console.error(`Error fetching payment history for group ${groupId}:`, error);
    throw error;
  }
};