import api from "../../utils/axios"
import URLS from "../../utils/constants"
export const verifyOtpAPI = async (otp: number) => {
    const response = await api.post(URLS.VERIFY_OTP, {otp});
    return response.data;
}