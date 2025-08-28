

const validatePhoneNumber = (phone: string): ValidationResult => {
    if (/^\+?[1-9][0-9]{7,14}$/.test(phone)) {
        return { isValid: true };
    } else {
        return { isValid: false, errorText: "Invalid Phone Number" };
    }
};

export default validatePhoneNumber;
