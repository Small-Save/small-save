import api from "lib/axios";
import URLS from "lib/constants";
import type { BaseResponse, Contact, Group, User } from "types";

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

export const fetchUserGroups = async (): Promise<BaseResponse<Group[]>> => {
    const response = await api.get<BaseResponse<Group[]>>(URLS.GROUP.GET_USER_GROUPS);
    return response.data;
};


export const fetchGroup = async (groupId: string): Promise<BaseResponse<Group>>=>{
    const response = await api.get<BaseResponse<Group>>(URLS.GROUP.GROUP_DETAILS(groupId))
    return response.data;
}