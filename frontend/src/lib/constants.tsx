const URLS = {
    // BASE_URL: Capacitor.getPlatform() ==="android"? "http://10.0.2.2:8000/": "http://127.0.0.1:8000/",
    WS_BASE_URL: "ws://127.0.0.1:8000/",
    BASE_URL: "http://127.0.0.1:8000/",
    SEND_OTP: "/auth/send_otp/",
    VERIFY_OTP: "/auth/verify_otp/",
    REGISTER: "/auth/register/",
    LOGOUT: "/auth/logout/",

    GROUP: {
        VERIFY_CONTACTS: "/groups/verify-contacts/",
        CREATE_GROUP: "/groups/create/",
        GET_USER_GROUPS: "/groups/",
        GROUP_DETAILS: (groupId: string) => `/groups/${groupId}/`
    },
    BIDDING: {
        BIDDING_ROOM: "bidding/"
    },
    PAYMENTS: {
        CURRENT_PAYMENT_STATUS: "/payments/",
        GIVER_CONFIRM: (paymentId: string) => `/payments/${paymentId}/giver-confirm/`,
        RECEIVER_CONFIRM: (paymentId: string) => `/payments/${paymentId}/receiver-confirm/`,
        DETAILS: (paymentId: string) => `/payments/${paymentId}/`,
        GROUP_ALL: (groupId: string) => `/payments/${groupId}/all/`
    }
};

export default URLS;
