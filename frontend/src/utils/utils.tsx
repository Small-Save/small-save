

const validatePhoneNumber = (phone: string): ValidationResult => {
    if (/^\d{10,15}$/.test(phone)) {
        return { isValid: true };
    } else {
        return { isValid: false, errorText: "Invalid Phone Number" };
    }
};

export default validatePhoneNumber;
