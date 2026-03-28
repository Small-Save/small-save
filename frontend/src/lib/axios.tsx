import { Preferences } from "@capacitor/preferences";
import axios from "axios";

import URLS from "./constants";
import { toast } from "Hooks/useToast";

const api = axios.create({
    baseURL: URLS.BASE_URL,
    timeout: 5000
});

api.interceptors.request.use(
    async (config) => {
        //todo: change this to capacitor preference
        // const token = localStorage.getItem("authToken");
        const accessToken = await Preferences.get({ key: "access_token" });
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken.value}`;
        }
        config.headers["X-Timezone"] = Intl.DateTimeFormat().resolvedOptions().timeZone;

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const status = error.response?.status ?? null;

        if (status === 401) {
            toast({ message: "Session expired. Please log in again.", color: "warning" });
        } else if (status === 500) {
            toast({ message: "Server error. Please try again later.", color: "danger" });
        } else if (!error.response) {
            toast({ message: "Network error. Check your connection.", color: "danger" });
        }

        return Promise.reject(error);
    }
);

export default api;
