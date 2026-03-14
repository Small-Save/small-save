import URLS from "lib/constants";
import { useEffect, useRef } from "react";

type BidUpdateMessage<TBid> = {
    type: "bid_update";
    bid: TBid;
};

const isBidUpdateMessage = <TBid,>(value: unknown): value is BidUpdateMessage<TBid> => {
    if (!value || typeof value !== "object") return false;
    const record = value as Record<string, unknown>;
    return record.type === "bid_update" && "bid" in record;
};

export const useBiddingSocket = <TBid,>(roundId: string, onBidUpdate: (bid: TBid) => void) => {
    const socketRef = useRef<WebSocket | null>(null);
    const onBidUpdateRef = useRef(onBidUpdate);

    useEffect(() => {
        onBidUpdateRef.current = onBidUpdate;
    }, [onBidUpdate]);

    useEffect(() => {
        // Guard against empty roundId
        if (!roundId) {
            console.warn("Round ID is empty, skipping WebSocket connection");
            return;
        }

        const wsUrl = `${URLS.WS_BASE_URL}ws/bidding/${roundId}/`;
        console.log("Connecting to WebSocket:", wsUrl);

        const socket = new WebSocket(wsUrl);

        socketRef.current = socket;

        socket.onmessage = (event) => {
            try {
                const data: unknown = JSON.parse(event.data);
                if (isBidUpdateMessage<TBid>(data)) {
                    onBidUpdateRef.current(data.bid);
                }
            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        };

        socket.onopen = () => {
            console.log("WebSocket connected successfully to:", wsUrl);
        };

        socket.onclose = () => {
            console.log("WebSocket disconnected");
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
            console.error("WebSocket URL was:", wsUrl);
        };

        return () => {
            if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
                socket.close();
            }
        };
    }, [roundId]);

    return socketRef;
};
