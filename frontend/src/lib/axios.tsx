import { Preferences } from "@capacitor/preferences";
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { toast } from "Hooks/useToast";

import URLS from "./constants";

const baseConfig = {
    baseURL: URLS.BASE_URL,
    timeout: 5000
};

const onResponseError = (error: AxiosError) => {
    const status = error.response?.status ?? null;

    if (status === 401) {
        toast({ message: "Session expired. Please log in again.", color: "warning" });
    } else if (status === 500) {
        toast({ message: "Server error. Please try again later.", color: "danger" });
    } else if (!error.response) {
        toast({ message: "Network error. Check your connection.", color: "danger" });
    }

    return Promise.reject(error);
};

const attachTimezoneHeader = async (config: InternalAxiosRequestConfig) => {
    config.headers["X-Timezone"] = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return config;
};

/** Public endpoints: login, OTP, register — no Bearer token. */
export const publicApi = axios.create(baseConfig);

publicApi.interceptors.request.use(attachTimezoneHeader, (error) => Promise.reject(error));

publicApi.interceptors.response.use((response) => response, onResponseError);

/** Authenticated endpoints — sends `Authorization: Bearer` when an access token exists. */
export const api = axios.create(baseConfig);

api.interceptors.request.use(
    async (config) => {
        const { value } = await Preferences.get({ key: "access_token" });
        if (value) {
            config.headers.Authorization = `Bearer ${value}`;
        }
        return attachTimezoneHeader(config);
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use((response) => response, onResponseError);

/** Same as `api` — kept for call sites that still use default import. */
export default api;
