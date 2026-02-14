import api from "lib/axios";
import URLS from "lib/constants";
import { BaseResponse, Group, User } from "types";

export type Bidder = User & { username: string };

export interface BiddingRound {
    id: number;
    group: number;
    round_number: number;
    scheduled_time: string;
    start_time: string;
    end_time: string;
    status: "completed" | "active" | "scheduled" | "cancelled";
    winner: number;
    winner_username: string;
    winning_bid: string;
    total_bids: number;
}

export interface BiddingRoomData {
    bidding_round: BiddingRound;
    current_lowest_bid: number;
    can_bid: boolean;
}

export interface Bid {
    id: number;
    bidding_round: number;
    member: Bidder;
    amount: string;
    timestamp: string;
    username: string;
    is_valid: boolean;
}
export interface BiddingStatus {
    status: "completed" | "active" | "scheduled" | "cancelled";
    current_lowest: number | null;
    lowest_bidder: string | null;
    bids: Bid[];
    time_remaining: number | null;
}

export const fetchBiddingDetails = async (roundId: string): Promise<BaseResponse<BiddingRoomData>> => {
    try {
        const response = await api.get(URLS.BIDDING.BIDDING_ROOM + roundId);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const fetchBiddingStatus = async (roundId: string): Promise<BaseResponse<BiddingStatus>> => {
    try {
        const response = await api.get(`/bidding/${roundId}/status/`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};


export const fetchGroupDetails = async (groupId: string): Promise<BaseResponse<Group>> => {
    try {
        const response = await api.get(`/groups/${groupId}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const placeBid = async (roundId: string, bidAmount: number): Promise<BaseResponse<Bid>> => {
    try {
        const response = await api.post(`/bidding/${roundId}/place_bid/`, {
            amount: bidAmount
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const connectToBiddingRoom = (roundId: string): Promise<WebSocket> => {
    return new Promise((resolve, reject) => {
        const wsUrl = `${URLS.WS_BASE_URL}ws/bidding/${roundId}/`;
        console.log("Attempting WebSocket connection to:", wsUrl);

        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log("WebSocket connected successfully");
            resolve(socket);
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
            console.error("WebSocket readyState:", socket.readyState);
            reject(new Error(`WebSocket connection failed: ${error}`));
        };

        socket.onclose = (event) => {
            console.log("WebSocket closed:", event.code, event.reason);
        };
    });
};
