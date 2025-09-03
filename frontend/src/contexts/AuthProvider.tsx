import React, { createContext, useState, useEffect, ReactNode } from "react";
import axios, { AxiosError } from "axios";
import { Preferences } from "@capacitor/preferences";
import URLS from "../utils/constants";

interface User {
    accessToken: string;
    refreshToken?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    sendOtp: (phone_number: string) => Promise<boolean>;
    verifyOtp: (phone_number: string, otp_code: number) => Promise<boolean>;
    register: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
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
                if (accessToken) {
                    setUser({ accessToken, refreshToken: refreshToken || undefined });
                }
            } catch (error) {
                console.error("Error checking auth:", error);
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

    const verifyOtp = async (phone_number: string, otp_code: number): Promise<boolean> => {
        try {
            const response = await axios.post(`${URLS.BASE_URL}/${URLS.VERIFY_OTP}`, { phone_number, otp_code });
            if (response.status === 200) {
                const { access, refresh } = response.data;
                await Preferences.set({ key: "access_token", value: access });
                await Preferences.set({ key: "refresh_token", value: refresh });
                setUser({ accessToken: access, refreshToken: refresh });
                return true;
            }
            throw new Error(response.data.message || "OTP verification failed");
        } catch (error) {
            console.error("Verify OTP error:", error);
            return false;
        }
    };

    const register = async (email: string, password: string): Promise<boolean> => {
        try {
            const response = await axios.post("/register", { email, password });
            if (response.status === 200 || response.status === 201) {
                const { access, refresh } = response.data;
                await Preferences.set({ key: "access_token", value: access });
                await Preferences.set({ key: "refresh_token", value: refresh });
                setUser({ accessToken: access, refreshToken: refresh });
                return true;
            }
            throw new Error(response.data.message || "Registration failed");
        } catch (error) {
            console.error("Registration error:", error);
            return false;
        }
    };

    const logout = async (): Promise<void> => {
        try {
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
