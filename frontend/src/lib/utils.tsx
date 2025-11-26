import { Contacts } from "@capacitor-community/contacts";
import { Contact, ValidationResult } from "types";

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

export const fetchDeviceContacts = async (): Promise<Contact[] | undefined> => {
    // console.log("Platform:", Capacitor.getPlatform());
    // console.log("Is native?:", Capacitor.isNativePlatform());

    //     const { contacts } = await Contacts.getContacts({
    //         projection: {
    //             name: true,
    //             phones: true,
    //             emails: true
    //         }
    //     });

    //     return contacts.map((c) => ({
    //         username: c.name?.display || "Unknown",
    //         phone_number: c.phones?.[0]?.number || "",
    //         email: c.emails?.[0]?.address || ""
    //     }));
    // } catch (error) {
    //     console.error("=== ERROR ===", error);
    // }

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
};
