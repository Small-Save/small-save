import api from "lib/axios";
import URLS from "lib/constants";
import type { BaseResponse } from "types";

export const logoutUser = async (refreshToken: string): Promise<BaseResponse<null>> => {
    try {
        const response = await api.post(URLS.LOGOUT, { refresh: refreshToken });
        return response.data;
    } catch (error) {
        console.error("Error during logout:", error);
        throw error;
    }
};