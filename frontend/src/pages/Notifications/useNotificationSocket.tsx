import { Preferences } from "@capacitor/preferences";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { toast } from "Hooks/useToast";
import URLS from "lib/constants";
import useNotificationStore from "stores/useNotifications";

import type { Notification } from "./services";

interface WsMessage {
    type: "notification";
    notification: Notification;
}

const isNotificationMessage = (value: unknown): value is WsMessage => {
    if (!value || typeof value !== "object") return false;
    const record = value as Record<string, unknown>;
    return record.type === "notification" && "notification" in record;
};

const RECONNECT_BASE_MS = 2000;
const RECONNECT_MAX_MS = 30000;
const MAX_RETRIES = 10;

export function useNotificationSocket() {
    const socketRef = useRef<WebSocket | null>(null);
    const reconnectTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const retryCount = useRef(0);
    const queryClient = useQueryClient();

    useEffect(() => {
        let unmounted = false;

        async function connect() {
            const { value: token } = await Preferences.get({ key: "access_token" });
            if (!token || unmounted) return;

            const wsUrl = `${URLS.WS_BASE_URL}${URLS.NOTIFICATIONS.WS}?token=${token}`;
            const socket = new WebSocket(wsUrl);
            socketRef.current = socket;

            socket.onopen = () => {
                retryCount.current = 0;
            };

            socket.onmessage = (event) => {
                try {
                    const data: unknown = JSON.parse(event.data);
                    if (isNotificationMessage(data)) {
                        useNotificationStore.getState().incrementUnread();
                        queryClient.invalidateQueries({ queryKey: ["notifications"] });

                        toast({
                            header: data.notification.title,
                            message: data.notification.body,
                            duration: 4000,
                            color: "primary",
                            position: "top",
                        });
                    }
                } catch (err) {
                    console.error("Error parsing notification WS message:", err);
                }
            };

            socket.onclose = () => {
                if (unmounted || retryCount.current >= MAX_RETRIES) return;
                const delay = Math.min(
                    RECONNECT_BASE_MS * 2 ** retryCount.current,
                    RECONNECT_MAX_MS
                );
                retryCount.current += 1;
                reconnectTimer.current = setTimeout(connect, delay);
            };

            socket.onerror = (err) => {
                console.error("Notification WebSocket error:", err);
                socket.close();
            };
        }

        connect();

        return () => {
            unmounted = true;
            clearTimeout(reconnectTimer.current);
            if (
                socketRef.current &&
                (socketRef.current.readyState === WebSocket.OPEN ||
                    socketRef.current.readyState === WebSocket.CONNECTING)
            ) {
                socketRef.current.close();
            }
        };
    }, [queryClient]);

    return socketRef;
}
