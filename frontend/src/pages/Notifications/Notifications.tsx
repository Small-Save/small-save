import React, { useCallback } from "react";

import {
    IonButton,
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonPage,
    IonRefresher,
    IonRefresherContent,
    IonSpinner
} from "@ionic/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    cashOutline,
    checkmarkDoneOutline,
    megaphoneOutline,
    notificationsOutline,
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
    type Notification,
    type NotificationType
} from "./services";
import { getTimeAgo } from "lib/utils";

const typeIcon: Record<NotificationType, string> = {
    bidding_started: megaphoneOutline,
    bidding_ended: timerOutline,
    bidding_won: trophyOutline,
    payment_due: cashOutline,
    payment_confirmed: checkmarkDoneOutline
};

const typeColor: Record<NotificationType, string> = {
    bidding_started: "text-blue-500",
    bidding_ended: "text-orange-500",
    bidding_won: "text-yellow-500",
    payment_due: "text-red-500",
    payment_confirmed: "text-green-500"
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
            if (notif.data) {
                const d = notif.data as Record<string, unknown>;
                if (d.round_id) {
                    history.push(`/payments/${d.round_id}`);
                } else if (d.group_id) {
                    history.push(`/groupdetail/${d.group_id}`);
                }
            }
        },
        [readMutation, history]
    );

    const notifList = notifResponse?.data ?? [];
    const hasUnread = notifList.some((n) => !n.is_read);

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
                                          {readAllMutation.isPending ? <IonSpinner name="dots" /> : "Read all"}
                                      </IonButton>
                                  ),
                                  slot: "end"
                              }
                          ]
                        : undefined
                }
            />

            <IonContent>
                <IonRefresher slot="" onIonRefresh={handleRefresh}>
                    <IonRefresherContent />
                </IonRefresher>

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <IonSpinner name="crescent" />
                    </div>
                ) : notifList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <IonIcon icon={notificationsOutline} className="text-6xl mb-4" />
                        <p className="text-lg font-semibold">No notifications yet</p>
                        <p className="text-sm">You'll see updates about bidding and payments here.</p>
                    </div>
                ) : (
                    <IonList lines="full">
                        {notifList.map((notif) => (
                            <IonItem
                                key={notif.id}
                                button
                                detail={false}
                                onClick={() => handleTap(notif)}
                                className={notif.is_read ? "opacity-60" : ""}
                            >
                                <div slot="start" className="flex items-center pr-3">
                                    <IonIcon
                                        icon={typeIcon[notif.notification_type]}
                                        className={`text-2xl ${typeColor[notif.notification_type]}`}
                                    />
                                </div>
                                <IonLabel>
                                    <div className="flex items-center gap-2">
                                        <h2 className={`text-sm ${notif.is_read ? "font-normal" : "font-bold"}`}>
                                            {notif.title}
                                        </h2>
                                        {!notif.is_read && (
                                            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">{notif.body}</p>
                                    <p className="text-xs text-gray-400 mt-1">{getTimeAgo(notif.created_at)}</p>
                                </IonLabel>
                            </IonItem>
                        ))}
                    </IonList>
                )}
            </IonContent>

            <BottomNav />
        </IonPage>
    );
};

export default Notifications;
