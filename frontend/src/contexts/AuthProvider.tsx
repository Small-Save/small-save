// src/contexts/AuthProvider.tsx
import React, { createContext, ReactNode, useEffect, useState } from "react";

import { Preferences } from "@capacitor/preferences";
import { jwtDecode } from "jwt-decode";
import { useHistory } from "react-router-dom";

import { toast } from "Hooks/useToast";
import { api, publicApi } from "lib/axios";
import URLS from "lib/constants";
import type { BaseResponse } from "types";

// TODO need to implement refresh token funtionality

// ----------------- Types -----------------
interface User {
    id: string;
    phone_number: string;
    user_name: string;
    gender: string;
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
    register: (
        phone_number: string | undefined,
        first_name: string,
        last_name: string,
        gender: string
    ) => Promise<boolean>;
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

// ----------------- Helpers -----------------
const saveAuthData = async (access: string, refresh: string, user: User) => {
    await Preferences.set({ key: "access_token", value: access });
    await Preferences.set({ key: "refresh_token", value: refresh });
    await Preferences.set({ key: "user", value: JSON.stringify(user) });
};

const clearAuthData = async () => {
    await Preferences.remove({ key: "access_token" });
    await Preferences.remove({ key: "refresh_token" });
    await Preferences.remove({ key: "user" });
};

const getStoredUser = async (): Promise<User | null> => {
    const { value } = await Preferences.get({ key: "user" });
    if (!value) return null;
    try {
        return JSON.parse(value) as User;
    } catch {
        return null;
    }
};

export const logoutUser = async (refreshToken: string): Promise<BaseResponse<null>> => {
    const response = await api.post(URLS.LOGOUT, { refresh: refreshToken });
    return response.data;
};

// ----------------- Provider -----------------
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    // TODO: remove this user | null type
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const history = useHistory();

    // Check for stored token on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { value: accessToken } = await Preferences.get({ key: "access_token" });
                const storedUser = await getStoredUser();

                if (accessToken) {
                    const decoded = jwtDecode<CustomJwtPayload>(accessToken);
                    const now = Math.floor(Date.now() / 1000);

                    if (decoded.exp && decoded.exp > now) {
                        setUser(storedUser);
                    } else {
                        // TODO: attempt refresh token
                        await clearAuthData();
                    }
                }
            } catch (error) {
                console.error("Auth check error:", error);
                await clearAuthData();
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    // ----------------- Auth Functions -----------------
    const sendOtp = async (phone_number: string): Promise<boolean> => {
        try {
            setLoading(true);
            const response = await publicApi.post(URLS.SEND_OTP, { phone_number });
            toast({ message: "OTP sent!", duration: 2000 });
            return response.status === 200 || response.status === 201;
        } catch {
            toast({ message: "Failed to send OTP. Please try again.", color: "danger" });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async (phone_number: string, otp_code: number): Promise<VerifyOtpResponse | false> => {
        try {
            setLoading(true);
            const response = await publicApi.post(URLS.VERIFY_OTP, { phone_number, otp_code });

            if (response.status === 200 && response.data.is_success) {
                if (response.data.data?.user.is_registered) {
                    const { access, refresh, user } = response.data.data;
                    await saveAuthData(access, refresh, user);
                    setUser(user);
                }
                return response.data;
            }
            toast({ message: "Invalid OTP. Please try again.", color: "danger" });
            return false;
        } catch {
            toast({ message: "Could not verify OTP. Please try again.", color: "danger" });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const register = async (
        phone_number: string | undefined,
        first_name: string,
        last_name: string,
        gender: string
    ): Promise<boolean> => {
        try {
            setLoading(true);
            const response = await publicApi.post(URLS.REGISTER, {
                phone_number,
                first_name,
                last_name,
                gender
            });

            if (response.status === 200 || response.status === 201) {
                const { access, refresh, user } = response.data.data;
                await saveAuthData(access, refresh, user);
                setUser(user);
                toast({ message: "Registration successful!", color: "success" });
                return true;
            }
            toast({ message: "Registration failed. Please try again.", color: "danger" });
            return false;
        } catch {
            toast({ message: "Registration failed. Please try again.", color: "danger" });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        try {
            const { value: refreshToken } = await Preferences.get({ key: "refresh_token" });
            await logoutUser(refreshToken || "");
            await clearAuthData();
            setUser(null);
            history.replace("/login");
            toast({ message: "You have been logged out.", color: "success" });
        } catch (error) {
            console.error(error);
            toast({ message: "Logout failed. Please try again.", color: "danger" });
        }
    };

    return (
        <AuthContext.Provider value={{ user, sendOtp, verifyOtp, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
