import { Contacts } from "@capacitor-community/contacts";

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

export const validateTargetAmount = (v: string): ValidationResult => {
    const amount = parseFloat(v);
    if (!isNaN(amount) && amount > 0) {
        return { isValid: true };
    } else {
        return { isValid: false, errorText: "Invalid Target Amount" };
    }
};
export const validateDuration = (v: string): ValidationResult => {
    const duration = parseInt(v);
    if (!isNaN(duration) && duration > 0) {
        return { isValid: true };
    } else {
        return { isValid: false, errorText: "Invalid Duration" };
    }
};
export const validateGroupSize = (v: string): ValidationResult => {
    const size = parseInt(v);
    if (!isNaN(size) && size > 0) {
        return { isValid: true };
    } else {
        return { isValid: false, errorText: "Invalid Group Size" };
    }
};


export const fetchDeviceContacts = async () => {
  const permission = await Contacts.requestPermissions();
  if (permission.contacts !== "granted") {
    throw new Error("Contacts permission denied");
  }

  const { contacts } = await Contacts.getContacts({
    projection: {
      name: true,
      phones: true,
      emails: true,
    },
  });

  return contacts.map((c) => ({
    name: c.name?.display || "Unknown",
    phone: c.phones?.[0]?.number || null,
    email: c.emails?.[0]?.address || null,
  }));
};