import { Contacts } from "@capacitor-community/contacts";
import { Capacitor } from "@capacitor/core";

import type { Contact, ValidationResult } from "types";

export const validatePhoneNumber = (phone: string): ValidationResult => {
    if (/^\d{10}$/.test(phone)) {
        return { isValid: true };
    } else {
        return { isValid: false, errorText: "Invalid Phone Number" };
    }
};

export const validateOtp = (otp: string): ValidationResult => {
    if (/^[0-9]{1,6}$/.test(otp)) {
        return { isValid: true };
    } else {
        return { isValid: false, errorText: "Enter the right OTP" };
    }
};

export const formatTime = (seconds: number) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
};

export const validateTargetAmount = (targetAmount: string, groupSize: string): ValidationResult => {
    const amount = parseFloat(targetAmount);
    const size = parseInt(groupSize);
    if (!isNaN(amount) && amount > 0) {
        return { isValid: true };
    } else if (amount % size === 0) {
        return { isValid: false, errorText: "Target amount should be a multiple of size" };
    } else {
        return { isValid: false, errorText: "Invalid Target Amount" };
    }
};
export const validateDuration = (v: string): ValidationResult => {
    const duration = parseInt(v);
    if (!isNaN(duration) && duration > 0) {
        return { isValid: true };
    } else if (duration <= 0) {
        return { isValid: false, errorText: "Duration should be positive number" };
    } else if (duration > 99) {
        return { isValid: false, errorText: "Duration cannot be more than 99" };
    } else {
        return { isValid: false, errorText: "Invalid duration" };
    }
};
export const validateGroupSize = (v: string): ValidationResult => {
    const size = parseInt(v);
    if (!isNaN(size) && size >= 5) {
        return { isValid: true };
    } else if (size < 5) {
        return { isValid: false, errorText: "Group size should be minimum 5" };
    } else if (size > 99) {
        return { isValid: false, errorText: "Group size cannot be more than 99" };
    } else {
        return { isValid: false, errorText: "Invalid Group Size" };
    }
};

export const formatINR = (amount: number | string) => {
    const n = Number(amount || 0);
    return Number.isNaN(n) ? "0" : n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
};

export const calculateTimeLeft = (end_time: string, start_time: string) => {
    const now = new Date().getTime();
    const endTime = new Date(end_time).getTime();
    const startTime = new Date(start_time).getTime();

    // Validate dates
    if (isNaN(endTime) || isNaN(startTime)) {
        console.error("Invalid date format:", {
            end_time: end_time,
            start_time: start_time
        });
        return;
    }
    const difference = endTime - now;

    if (difference > 0) {
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        return `${hours}h ${minutes}m ${seconds}s`;
    } else {
        return "0h 0m 0s";
    }
};


export const fetchDeviceContacts = async (): Promise<Contact[]> => {
    if (!Capacitor.isNativePlatform()) {
        // Send constant values on web
        return [
            {
                username: "Rithvik kantha",
                phone_number: "7337264708",
                email: "rithivk.kantha@cyberark.com"
            },
            {
                username: "Pranay Sharma",
                phone_number: "6281865323",
                email: "sharma@sharma.sol"
            },
            {
                username: "Rithvik kantha 2",
                phone_number: "8907456273",
                email: "rithvikkantha3771@gmail.com"
            },
            {
                username: "Rithvik kantha 3",
                phone_number: "8799374339",
                email: "rithvikkantha3771@gmail.com"
            },
            {
                username: "Rithvik kantha 4",
                phone_number: "2131231231",
                email: "rithvikkantha3771@gmail.com"
            },
            {
                username: "Rithvik kantha 5",
                phone_number: "1234564234",
                email: "rithvikkantha3771@gmail.com"
            },
            {
                username: "Phanindhra",
                phone_number: "8686965012",
                email: "Phani@gmail.com"
            },
            {
                username: "Chutiya",
                phone_number: "2133123435",
                email: "noob@gmail.com"
            }
        ];
    }
    try {
        const permission = await Contacts.requestPermissions();
        if (permission.contacts !== "granted") {
            throw new Error("Contacts permission denied");
        }

        const { contacts } = await Contacts.getContacts({
            projection: {
                name: true,
                phones: true,
                emails: true
            }
        });

        return contacts.map((c) => ({
            username: c.name?.display || "Unknown",
            phone_number: c.phones?.[0]?.number || "",
            email: c.emails?.[0]?.address || ""
        }));
    } catch (error) {
        console.error("Contacts fetch failed", error);
        return [];
    }
};

export const formatAmount = (amount: number | string) =>
    Number(amount).toLocaleString("en-IN", { maximumFractionDigits: 0 });

export const formatAmountCompact = (amount: number | string): string => {
    const n = Number(amount);
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
    return String(n);
};

export const getInitials = (name: string) =>
    name
        .split(/\s+/)
        .map((s) => s[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

export const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const seconds = Math.floor(diff / 1000);

    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
};
