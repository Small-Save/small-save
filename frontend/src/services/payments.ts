import api from "lib/axios";
import URLS from "lib/constants";
import type { User, BaseResponse, Group, paymentStatus, GroupPaymentHistoryResponse, PaymentDetail } from "types";


export const fetchCurrentPaymentStatus = async (groupid: number , round_id:number): Promise<BaseResponse<paymentStatus>> => {
try {
    const response = await api.get(URLS.PAYMENTS.CURRENT_PAYMENT_STATUS +'/group/'+groupid+'/round/'+round_id);
    return response.data
} catch(erorr) {
    console.error(erorr);
    throw erorr;
}
}


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
    // Log the error with the specific groupId for easier debugging
    console.error(`Error fetching payment history for group ${groupId}:`, error);
    throw error;
  }
};


// export const fetchGroupPaymentHistory = async (
//   groupId: number | string
// ): Promise<BaseResponse<GroupPaymentHistoryResponse>> => {
//   try {
//     // 1. Define the inner payload
//     const mockPayload: GroupPaymentHistoryResponse = {
//     "group_name": "December Savings Club",
//     "rounds": [
//         {
//             "round_number": 1,
//             "winner": "rithvikkantha",
//             "scheduled_time": "2024-05-20T04:30:00+00:00"
//         }
//     ]
// }

//     // 2. Wrap it in your BaseResponse structure
//     // (Assuming BaseResponse looks like { data: T, status?: number, etc. })
//     const response: BaseResponse<GroupPaymentHistoryResponse> = {
//       data: mockPayload, 
//       // add other required BaseResponse fields here if TypeScript complains (e.g., status: 200, message: "Success")
//     } as BaseResponse<GroupPaymentHistoryResponse>; // Type assertion helps if BaseResponse has strict optional fields

//     return Promise.resolve(response);
//   } catch (error) {
//     console.error(`Error fetching payment history for group ${groupId}:`, error);
//     throw error;
//   }
// };


// export const getPaymentDetails = async (
//   paymentId: number | string
// ): Promise<BaseResponse<PaymentDetail>> => {
  
//   // 1. Simulate a network delay of 800ms so you can see your loading spinner
//   await new Promise((resolve) => setTimeout(resolve, 800));

//   // 2. Define the mock payload based on your interface
//   const mockPayload: PaymentDetail = {
//     group_id: 11,
//     group_name: "College Fund Group",
//     giver_id: "12c8bd90-36fe-4253-8d78-b5bbc89aa4cf",
//     giver_name: "Arun Kumar",
//     receiver_id: "a23357d7-cecf-4222-9542-7dd055819bca",
//     receiver_name: "Sharmila",
//     amount: 250.00,
//     status: "PENDING", 
//   };

//   // 3. Wrap it in your BaseResponse structure
//   const mockResponse: BaseResponse<PaymentDetail> = {
//     is_success: true,
//     data: mockPayload,
//     toast_message: null,
//     message: "Payment details fetched successfully",
//     error: null,
//   };

//   return Promise.resolve(mockResponse);
// };






// export const fetchCurrentPaymentStatus = async (): Promise<BaseResponse<paymentStatus>> => {
// try {
//     const data: BaseResponse<paymentStatus> = {
//     "is_success": true,
//     "data": {
//         "group_id": 11,
//         "round_id": 1,
//         "payments": [
//             {
//                 "id": 7,
//                 "giver": "12c8bd90-36fe-4253-8d78-b5bbc89aa4cf",
//                 "giver_name": "dsadasdsad",
//                 "receiver": "a23357d7-cecf-4222-9542-7dd055819bca",
//                 "receiver_name": "rithvikkantha",
//                 "amount": "5000.00",
//                 "status": "GIVER_CONFIRMED",
//                 "created_at": "2026-02-05T00:48:56.443944Z"
//             },
//             {
//                 "id": 6,
//                 "giver": "360370b2-85bb-4945-a9ef-361960436a21",
//                 "giver_name": "fdffdsfsdf",
//                 "receiver": "a23357d7-cecf-4222-9542-7dd055819bca",
//                 "receiver_name": "rithvikkantha",
//                 "amount": "5000.00",
//                 "status": "PENDING",
//                 "created_at": "2026-02-05T00:48:56.443944Z"
//             },
//             {
//                 "id": 5,
//                 "giver": "a6b43d45-36f7-48cf-978a-d0e822f3278e",
//                 "giver_name": "dasddsadas",
//                 "receiver": "a23357d7-cecf-4222-9542-7dd055819bca",
//                 "receiver_name": "rithvikkantha",
//                 "amount": "5000.00",
//                 "status": "PENDING",
//                 "created_at": "2026-02-05T00:48:56.443944Z"
//             },
//             {
//                 "id": 4,
//                 "giver": "b3456c85-db4a-4007-81dd-a54bcd0f96b6",
//                 "giver_name": "dasddsad",
//                 "receiver": "a23357d7-cecf-4222-9542-7dd055819bca",
//                 "receiver_name": "rithvikkantha",
//                 "amount": "5000.00",
//                 "status": "PENDING",
//                 "created_at": "2026-02-05T00:48:56.443944Z"
//             },
//             {
//                 "id": 3,
//                 "giver": "a23357d7-cecf-4222-9542-7dd055819bca",
//                 "giver_name": "rithvikkantha",
//                 "receiver": "a23357d7-cecf-4222-9542-7dd055819bca",
//                 "receiver_name": "rithvikkantha",
//                 "amount": "5000.00",
//                 "status": "PENDING",
//                 "created_at": "2026-02-05T00:48:56.443944Z"
//             },
//             {
//                 "id": 2,
//                 "giver": "d02faf88-f30c-40e7-90d9-96722e015380",
//                 "giver_name": "rithvikkantha",
//                 "receiver": "a23357d7-cecf-4222-9542-7dd055819bca",
//                 "receiver_name": "rithvikkantha",
//                 "amount": "5000.00",
//                 "status": "PENDING",
//                 "created_at": "2026-02-05T00:48:56.443944Z"
//             }
//         ]
//     },
//     "message": "Payment status fetched successfully",
//     "toast_message": null,
//     "error": ""
// }
//     return Promise.resolve(data);
// } catch(error) {
//     return {
//       is_success: false,
//       data: null,
//       toast_message: null,
//       message: null,
//       error: "Failed to fetch groups",
//     };
// }
// }