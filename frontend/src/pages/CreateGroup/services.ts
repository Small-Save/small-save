import api from "lib/axios";
import URLS from "lib/constants";

type VerifyContactsResponse = {
    existing_users: User[];
    invite_needed: Contact[];
    invalid_contacts: User[];
};

export const verifyContacts = async (
    contacts: Contact[]
): Promise<BaseResponse<VerifyContactsResponse> | undefined> => {
    try {
        const response = await api.post(URLS.GROUP.VERIFY_CONTACTS, { contacts });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export interface Group {
    id: number;
    name: string;
    target_amount: string;
    size: number;
    duration: number;
    winner_selection_method: string;
    start_date: string; // ISO date string
    created_at: string; // ISO timestamp
    members: Member[];
}

export interface Member {
    user: User;
    joined_at: string; // ISO timestamp
}

export const createGroup = async (data: any): Promise<BaseResponse<Group>> => {
    try {
        const response = await api.post(URLS.GROUP.CREATE_GROUP, {
            ...data
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
