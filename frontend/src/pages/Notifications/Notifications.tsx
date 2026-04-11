import React, { useCallback, useMemo } from "react";

import {
    IonButton,
    IonContent,
    IonIcon,
    IonPage,
    IonRefresher,
    IonRefresherContent,
    IonSpinner
} from "@ionic/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    cashOutline,
    checkmarkDoneOutline,
    chevronForward,
    megaphoneOutline,
    notificationsOffOutline,
    timerOutline,
    trophyOutline
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import useNotificationStore from "stores/useNotifications";

import BottomNav from "components/BottomNav";
import { HeaderBox } from "components/HeaderBox";

import {
    fetchNotifications,
    fetchUnreadCount,
    markAllAsRead,
    markAsRead,
    type Notification
} from "./services";
import { getTimeAgo } from "lib/utils";


// TODO:: We can change the icons and colors to match the app's design system
const typeConfig: Record<string, { icon: string; bg: string; color: string }> = {
    bidding_started: { icon: megaphoneOutline, bg: "bg-blue-100", color: "text-blue-600" },
    bidding_ended: { icon: timerOutline, bg: "bg-orange-100", color: "text-orange-600" },
    bidding_won: { icon: trophyOutline, bg: "bg-yellow-100", color: "text-yellow-600" },
    payment_due: { icon: cashOutline, bg: "bg-red-100", color: "text-red-600" },
    payment_confirmed: { icon: checkmarkDoneOutline, bg: "bg-green-100", color: "text-green-600" }
};

const defaultConfig = { icon: megaphoneOutline, bg: "bg-gray-100", color: "text-gray-600" };

function getDateGroup(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 86_400_000); // 86_400_000 milliseconds = 24 hours

    if (date >= startOfToday) return "Today";
    if (date >= startOfYesterday) return "Yesterday";
    return "Earlier";
}

function groupByDate(notifications: Notification[]) {
    const groups: { label: string; items: Notification[] }[] = [];
    let current: (typeof groups)[number] | null = null;

    for (const n of notifications) {
        const label = getDateGroup(n.created_at);
        if (!current || current.label !== label) {
            current = { label, items: [] };
            groups.push(current);
        }
        current.items.push(n);
    }

    return groups;
}

const NotificationCard: React.FC<{
    notif: Notification;
    onTap: (n: Notification) => void;
}> = ({ notif, onTap }) => {
    const cfg = typeConfig[notif.notification_type] ?? defaultConfig;

    return (
        <button
            onClick={() => onTap(notif)}
            className={`flex items-center gap-3 w-full rounded-2xl px-4 py-3 text-left transition-all active:scale-[0.98] ${
                notif.is_read ? "bg-white opacity-70" : "bg-white shadow-sm"
            }`}
        >
            <div
                className={`flex items-center justify-center w-11 h-11 rounded-full shrink-0 ${cfg.bg}`}
            >
                <IonIcon icon={cfg.icon} className={`text-xl ${cfg.color}`} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <span
                        className={`text-sm leading-snug truncate ${
                            notif.is_read ? "font-medium text-gray-700" : "font-bold text-gray-900"
                        }`}
                    >
                        {notif.title}
                    </span>
                    {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.body}</p>
                <p className="text-[11px] text-gray-400 mt-1">{getTimeAgo(notif.created_at)}</p>
            </div>

            <IonIcon icon={chevronForward} className="text-gray-300 text-lg shrink-0" />
        </button>
    );
};

const Notifications: React.FC = () => {
    const history = useHistory();
    const queryClient = useQueryClient();
    const { setUnreadCount, resetUnread } = useNotificationStore();

    const { data: notifResponse, isLoading } = useQuery({
        queryKey: ["notifications"],
        queryFn: () => fetchNotifications(),
        staleTime: 1000 * 30
    });

    useQuery({
        queryKey: ["notifications", "unread-count"],
        queryFn: async () => {
            const res = await fetchUnreadCount();
            if (res.is_success && res.data) {
                setUnreadCount(res.data.count);
            }
            return res;
        },
        staleTime: 1000 * 30
    });

    const readMutation = useMutation({
        mutationFn: markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
        }
    });

    const readAllMutation = useMutation({
        mutationFn: markAllAsRead,
        onSuccess: () => {
            resetUnread();
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
        }
    });

    const handleTap = useCallback(
        (notif: Notification) => {
            if (!notif.is_read) {
                readMutation.mutate(notif.id);
            }
            const link = (notif.data as Record<string, unknown> | undefined)?.link;
            if (typeof link === "string") {
                history.push(link);
            }
        },
        [readMutation, history]
    );

    const notifList = notifResponse?.data ?? [];
    const hasUnread = notifList.some((n) => !n.is_read);
    const grouped = useMemo(() => groupByDate(notifList), [notifList]);

    const handleRefresh = async (event: CustomEvent) => {
        await queryClient.invalidateQueries({ queryKey: ["notifications"] });
        await queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
        event.detail.complete();
    };

    return (
        <IonPage>
            <HeaderBox
                title="Notifications"
                showBack={false}
                actions={
                    hasUnread
                        ? [
                              {
                                  key: "mark-all",
                                  element: (
                                      <IonButton
                                          fill="clear"
                                          size="small"
                                          onClick={() => readAllMutation.mutate()}
                                          disabled={readAllMutation.isPending}
                                      >
                                          {readAllMutation.isPending ? (
                                              <IonSpinner name="dots" />
                                          ) : (
                                              "Mark all read"
                                          )}
                                      </IonButton>
                                  ),
                                  slot: "end"
                              }
                          ]
                        : undefined
                }
            />

            <IonContent>
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent />
                </IonRefresher>

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <IonSpinner name="crescent" />
                    </div>
                ) : notifList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-72 px-8 text-center">
                        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-5">
                            <IonIcon
                                icon={notificationsOffOutline}
                                className="text-4xl text-gray-400"
                            />
                        </div>
                        <p className="text-lg font-bold text-gray-700">No notifications yet</p>
                        <p className="text-sm text-gray-400 mt-1">
                            Updates about bidding rounds and payments will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="px-4 pt-2 pb-4">
                        {grouped.map((group) => (
                            <div key={group.label} className="mb-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 px-1">
                                    {group.label}
                                </p>
                                <div className="flex flex-col gap-2">
                                    {group.items.map((notif) => (
                                        <NotificationCard
                                            key={notif.id}
                                            notif={notif}
                                            onTap={handleTap}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </IonContent>

            <BottomNav />
        </IonPage>
    );
};

export default Notifications;
