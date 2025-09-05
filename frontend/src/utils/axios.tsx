import axios from "axios";
import URLS from "./constants";

const api = axios.create({
    baseURL: URLS.BASE_URL,
    timeout: 5000
});

api.interceptors.request.use(
    (config) => {
        //todo: change this to capacitor preference
        const token = localStorage.getItem("authToken");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

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
