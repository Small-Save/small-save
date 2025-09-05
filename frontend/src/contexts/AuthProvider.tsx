import React, { createContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { Preferences } from "@capacitor/preferences";
import URLS from "../utils/constants";
import { jwtDecode } from "jwt-decode";

interface User {
    id: string;
    phone_number: string;
    user_name: string;
    is_registered: boolean;
}

interface VerifyOtpData {
    user: User;
    access: string;
    refresh: string;
}
type VerifyOtpResponse = BaseResponse<VerifyOtpData>;

interface AuthContextType {
    user: User | null;
    loading: boolean;
    sendOtp: (phone_number: string) => Promise<boolean>;
    verifyOtp: (phone_number: string, otp_code: number) => Promise<VerifyOtpResponse | false>;
    register: (firstName: string, lastName: string) => Promise<boolean>;
    // refreshToken: () => Promise<boolean>;
    logout: () => Promise<void>;
}

interface CustomJwtPayload {
    exp: number;
    iat?: number;
    id?: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Check for stored token on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { value: accessToken } = await Preferences.get({ key: "access_token" });
                const { value: refreshToken } = await Preferences.get({ key: "refresh_token" });
                const { value } = await Preferences.get({ key: "user" });
                let user: User | null = null;

                if (value) {
                    user = JSON.parse(value) as User;
                }

                if (accessToken) {
                    const decoded = jwtDecode<CustomJwtPayload>(accessToken);
                    const currentTime = Math.floor(Date.now() / 1000);

                    if (decoded.exp && decoded.exp > currentTime) {
                        // TODO: getUserDetails
                        setUser(user);
                    } else {
                        // Token expired, attempt refresh
                        // const refreshed = await refreshToken();
                        // if (!refreshed) {
                        //     await logout();
                        // }
                    }
                }
            } catch (error) {
                console.error("Error checking auth:", error);
                await logout();
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const sendOtp = async (phone_number: string): Promise<boolean> => {
        try {
            const response = await axios.post(`${URLS.BASE_URL}/${URLS.SEND_OTP}`, { phone_number });
            if (response.status === 200 || response.status === 201) {
                return true;
            }
            console.error("Unexpected response status:", response.status);
            return false;
        } catch (error) {
            console.error("Send OTP error:", error);
            return false;
        }
    };

    const verifyOtp = async (phone_number: string, otp_code: number): Promise<VerifyOtpResponse | false> => {
        try {
            const response = await axios.post(`${URLS.BASE_URL}/${URLS.VERIFY_OTP}`, { phone_number, otp_code });
            if (response.status === 200) {
                const { access, refresh, user } = response.data.data;
                // const decoded = jwtDecode<CustomJwtPayload>(access);
                await Preferences.set({ key: "access_token", value: access });
                await Preferences.set({ key: "refresh_token", value: refresh });
                await Preferences.set({ key: "user", value: JSON.stringify(user) });
                setUser(user);
                return response.data;
            }
            throw new Error(response.data.message || "OTP verification failed");
        } catch (error) {
            console.error("Verify OTP error:", error);
            return false;
        }
    };

    // const checkNetwork = async () => {
    //     const status = await Network.getStatus();
    //     if (!status.connected) {
    //         throw new Error("No internet connection");
    //     }
    // };

    const register = async (firstName: string, lastName: string): Promise<boolean> => {
        try {
            const response = await axios.post("/register", { firstName, lastName });
            if (response.status === 200 || response.status === 201) {
                const { access, refresh, user } = response.data.data;
                await Preferences.set({ key: "access_token", value: access });
                await Preferences.set({ key: "refresh_token", value: refresh });
                await Preferences.set({ key: "user", value: JSON.stringify(user) });
                setUser(user);
                return true;
            }
            throw new Error(response.data.message || "Registration failed");
        } catch (error) {
            console.error("Registration error:", error);
            return false;
        }
    };

    // const refreshToken = async (): Promise<boolean> => {
    //     try {
    //         const { value: refreshToken } = await Preferences.get({ key: "refresh_token" });
    //         if (!refreshToken) {
    //             throw new Error("No refresh token available");
    //         }
    //         // await checkNetwork();
    //         const response = await axios.post(`${URLS.BASE_URL}/refresh`, { refresh: refreshToken });
    //         if (response.status === 200) {
    //             const { access, refresh: newRefreshToken } = response.data.data;
    //             const decoded = jwtDecode<CustomJwtPayload>(access);
    //             await Preferences.set({ key: "access_token", value: access });
    //             if (newRefreshToken) {
    //                 await Preferences.set({ key: "refresh_token", value: newRefreshToken });
    //             }
    //             setUser(user);
    //             return true;
    //         }
    //         return false;
    //     } catch (error) {
    //         console.error("Token refresh error:", error);
    //         return false;
    //     }
    // };

    const logout = async (): Promise<void> => {
        try {
            // TODO: call BE API here
            await Preferences.remove({ key: "access_token" });
            await Preferences.remove({ key: "refresh_token" });
            setUser(null);
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, sendOtp, verifyOtp, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
