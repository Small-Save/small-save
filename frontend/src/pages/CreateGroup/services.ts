import api from "lib/axios";
import URLS from "lib/constants";
import type { User, Contact, BaseResponse, Group } from "types";

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
  try {
    const data: BaseResponse<Group[]> = {
    is_success: true,
    data: [
      {
        id: 3,
        name: "December Savings Club",
        target_amount: "1200.00",
        size: 2,
        duration: 5,
        winner_selection_method: "random",
        start_date: "2025-10-01",
        created_at: "2025-09-20T08:19:32.442209Z",
        members: [
          {
          
              id: "d02faf88-f30c-40e7-90d9-96722e015380",
              username: "rithvikkantha",
          },
        ],
      },
    ],
    message: "Groups fetched",
    toast_message: null,
    error: null,
  };

  // ✅ behaves like real API
  return Promise.resolve(data);
    const response = await api.get<BaseResponse<Group[]>>(URLS.GROUP.GET_USER_GROUPS);
    return response.data;
  } catch (error: any) {
    return {
      is_success: false,
      data: null,
      toast_message: null,
      message: null,
      error: error?.response?.data?.error || "Failed to fetch groups",
    };
  }
};