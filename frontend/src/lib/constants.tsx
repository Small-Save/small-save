
const URLS = {
    // BASE_URL: Capacitor.getPlatform() ==="android"? "http://10.0.2.2:8000/": "http://127.0.0.1:8000/",
    BASE_URL: "http://127.0.0.1:8000/",
    SEND_OTP: "/auth/send_otp/",
    VERIFY_OTP: "/auth/verify_otp/",
    REGISTER: "/auth/register/",

    GROUP: {
        VERIFY_CONTACTS: "/groups/verify-contacts/",
        CREATE_GROUP: "/groups/create/",
        GET_USER_GROUPS: "/groups"
    }
};

export default URLS;
