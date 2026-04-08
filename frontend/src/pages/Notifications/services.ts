import api from "lib/axios";
import URLS from "lib/constants";
import { BaseResponse } from "types";

export type NotificationType =
    | "bidding_started"
    | "bidding_ended"
    | "bidding_won"
    | "payment_due"
    | "payment_confirmed";

export interface Notification {
    id: number;
    notification_type: NotificationType;
    title: string;
    body: string;
    data: Record<string, unknown> | null;
    is_read: boolean;
    created_at: string;
}

export async function fetchNotifications(
    limit = 50,
    offset = 0
): Promise<BaseResponse<Notification[]>> {
    const response = await api.get(URLS.NOTIFICATIONS.LIST, {
        params: { limit, offset },
    });
    return response.data;
}

export async function fetchUnreadCount(): Promise<
    BaseResponse<{ count: number }>
> {
    const response = await api.get(URLS.NOTIFICATIONS.UNREAD_COUNT);
    return response.data;
}

export async function markAsRead(
    id: number
): Promise<BaseResponse<null>> {
    const response = await api.post(URLS.NOTIFICATIONS.MARK_READ(id));
    return response.data;
}

export async function markAllAsRead(): Promise<BaseResponse<null>> {
    const response = await api.post(URLS.NOTIFICATIONS.MARK_ALL_READ);
    return response.data;
}
