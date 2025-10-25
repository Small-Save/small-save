import axios from "axios";
import URLS from "./constants";
import { Preferences } from "@capacitor/preferences";

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
            config.headers.Authorization = `Bearer ${accessToken}`;
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
        const status = error.response ? error.response.status : null;

        if (status === 401) {
            console.log("Unauthorized: Redirecting to login...");
            // Example: window.location.href = '/login';
        } else if (status === 500) {
            // Internal Server Error
            console.log("Server Error: Something went wrong.");
        }

        return Promise.reject(error);
    }
);

export default api;
