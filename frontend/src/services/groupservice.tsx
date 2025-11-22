import api from "axios";
import URLS from "../utils/constants";
import { BaseResponse, Group } from "../types";


export const fetchUserGroups = async (): Promise<BaseResponse<Group[]>> => {
  try {
    // const response = await api.get<BaseResponse<Group[]>>(URLS.GET_USER_GROUPS);
    const response = {
    "is_success": true,
    "data": [
        {
            "id": 14,
            "name": "test 3",
            "target_amount": "12000.00",
            "size": 5,
            "duration": 12,
            "winner_selection_method": "random",
            "start_date": "2025-11-01T00:00:00Z",
            "created_at": "2025-11-01T11:56:11.634703Z",
            "members": [
                {
                    "id": "d02faf88-f30c-40e7-90d9-96722e015380",
                    "username": "rithvikkantha"
                },
                {
                    "id": "a23357d7-cecf-4222-9542-7dd055819bca",
                    "username": "rithvikkantha"
                },
                {
                    "id": "b3456c85-db4a-4007-81dd-a54bcd0f96b6",
                    "username": "dasddsad"
                },
                {
                    "id": "a6b43d45-36f7-48cf-978a-d0e822f3278e",
                    "username": "dasddsadas"
                },
                {
                    "id": "f3e4c61d-1ce6-4afd-8802-047c0a89097b",
                    "username": "dasdsdad"
                },
                {
                    "id": "8b8198e1-4f63-4693-bc03-69e9ce7c5503",
                    "username": "fdggfdg"
                }
            ]
        },
        {
            "id": 13,
            "name": "sharma",
            "target_amount": "1200.00",
            "size": 5,
            "duration": 5,
            "winner_selection_method": "random",
            "start_date": "2025-11-01T00:00:00Z",
            "created_at": "2025-10-31T14:02:08.925431Z",
            "members": [
                {
                    "id": "d02faf88-f30c-40e7-90d9-96722e015380",
                    "username": "rithvikkantha"
                },
                {
                    "id": "a23357d7-cecf-4222-9542-7dd055819bca",
                    "username": "rithvikkantha"
                },
                {
                    "id": "b3456c85-db4a-4007-81dd-a54bcd0f96b6",
                    "username": "dasddsad"
                },
                {
                    "id": "a6b43d45-36f7-48cf-978a-d0e822f3278e",
                    "username": "dasddsadas"
                },
                {
                    "id": "f3e4c61d-1ce6-4afd-8802-047c0a89097b",
                    "username": "dasdsdad"
                },
                {
                    "id": "8b8198e1-4f63-4693-bc03-69e9ce7c5503",
                    "username": "fdggfdg"
                }
            ]
        },
        {
            "id": 12,
            "name": "December Savings Club",
            "target_amount": "1200.00",
            "size": 5,
            "duration": 5,
            "winner_selection_method": "random",
            "start_date": "2025-11-01T00:00:00Z",
            "created_at": "2025-10-31T09:11:11.957422Z",
            "members": [
                {
                    "id": "d02faf88-f30c-40e7-90d9-96722e015380",
                    "username": "rithvikkantha"
                },
                {
                    "id": "a23357d7-cecf-4222-9542-7dd055819bca",
                    "username": "rithvikkantha"
                },
                {
                    "id": "b3456c85-db4a-4007-81dd-a54bcd0f96b6",
                    "username": "dasddsad"
                },
                {
                    "id": "a6b43d45-36f7-48cf-978a-d0e822f3278e",
                    "username": "dasddsadas"
                },
                {
                    "id": "360370b2-85bb-4945-a9ef-361960436a21",
                    "username": "fdffdsfsdf"
                },
                {
                    "id": "12c8bd90-36fe-4253-8d78-b5bbc89aa4cf",
                    "username": "dsadasdsad"
                }
            ]
        },
        {
            "id": 11,
            "name": "December Savings Club",
            "target_amount": "1200.00",
            "size": 5,
            "duration": 5,
            "winner_selection_method": "random",
            "start_date": "2025-11-01T00:00:00Z",
            "created_at": "2025-10-31T09:09:47.070474Z",
            "members": [
                {
                    "id": "d02faf88-f30c-40e7-90d9-96722e015380",
                    "username": "rithvikkantha"
                },
                {
                    "id": "a23357d7-cecf-4222-9542-7dd055819bca",
                    "username": "rithvikkantha"
                },
                {
                    "id": "b3456c85-db4a-4007-81dd-a54bcd0f96b6",
                    "username": "dasddsad"
                },
                {
                    "id": "a6b43d45-36f7-48cf-978a-d0e822f3278e",
                    "username": "dasddsadas"
                },
                {
                    "id": "360370b2-85bb-4945-a9ef-361960436a21",
                    "username": "fdffdsfsdf"
                },
                {
                    "id": "12c8bd90-36fe-4253-8d78-b5bbc89aa4cf",
                    "username": "dsadasdsad"
                }
            ]
        },
        {
            "id": 3,
            "name": "December Savings Club",
            "target_amount": "1200.00",
            "size": 2,
            "duration": 5,
            "winner_selection_method": "random",
            "start_date": "2025-10-01T00:00:00Z",
            "created_at": "2025-09-20T08:19:32.442209Z",
            "members": [
                {
                    "id": "d02faf88-f30c-40e7-90d9-96722e015380",
                    "username": "rithvikkantha"
                },
                {
                    "id": "360370b2-85bb-4945-a9ef-361960436a21",
                    "username": "fdffdsfsdf"
                },
                {
                    "id": "12c8bd90-36fe-4253-8d78-b5bbc89aa4cf",
                    "username": "dsadasdsad"
                }
            ]
        },
        {
            "id": 2,
            "name": "December Savings Club",
            "target_amount": "1200.00",
            "size": 2,
            "duration": 5,
            "winner_selection_method": "random",
            "start_date": "2025-10-01T00:00:00Z",
            "created_at": "2025-09-20T08:07:53.961037Z",
            "members": [
                {
                    "id": "d02faf88-f30c-40e7-90d9-96722e015380",
                    "username": "rithvikkantha"
                },
                {
                    "id": "360370b2-85bb-4945-a9ef-361960436a21",
                    "username": "fdffdsfsdf"
                },
                {
                    "id": "12c8bd90-36fe-4253-8d78-b5bbc89aa4cf",
                    "username": "dsadasdsad"
                }
            ]
        }
    ],
    "message": "Groups fetched",
    "toast_message": null,
    "error": ""
}
    return response;
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