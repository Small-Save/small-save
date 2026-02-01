import api from "lib/axios"
import URLS from "lib/constants"
import { BaseResponse } from "types"

export interface BiddingRound {
    id: number
    group: number
    group_name: string
    round_number: number
    scheduled_time: string
    start_time: string
    end_time: string
    status: "completed" | "active" | "scheduled" | "cancelled"
    winner: number
    winner_username: string
    winning_bid: string
    total_bids: number
}

export interface BiddingRoomData {
    bidding_round: BiddingRound
    current_lowest_bid: number
    can_bid: boolean
}

export const fetchBiddingDetails = async (biddingRoom: Number): Promise<BaseResponse<BiddingRoomData>> => {
    try {
        const response = await api.get(URLS.BIDDING.BIDDING_ROOM + biddingRoom)
        return response.data
    } catch (error) {
        console.error(error);
        throw error
    }
}