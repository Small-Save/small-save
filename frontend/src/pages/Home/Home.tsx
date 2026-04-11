import React, { useCallback, useContext } from "react";

import {
    IonContent,
    IonFab,
    IonFabButton,
    IonIcon,
    IonPage,
    IonRefresher,
    IonRefresherContent,
    IonSpinner
} from "@ionic/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { add, ellipsisVertical, peopleOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import useNotificationStore from "stores/useNotifications";

import BottomNav from "components/BottomNav";
import { HeaderBox } from "components/HeaderBox";
import { AuthContext } from "contexts/AuthProvider";
import { fetchUserGroups } from "pages/CreateGroup/services";
import { fetchUnreadCount } from "pages/Notifications/services";

import GroupCard from "./GroupCard";

const Home: React.FC = () => {
    const { user } = useContext(AuthContext)!;
    const { setUnreadCount } = useNotificationStore();
    const history = useHistory();
    const queryClient = useQueryClient();

    const { data: groupDetails, isLoading } = useQuery({
        queryKey: ["userGroups"],
        queryFn: fetchUserGroups,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10
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
        staleTime: 1000 * 60
    });

    const handleRefresh = useCallback(
        async (event: CustomEvent) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["userGroups"] }),
                queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] })
            ]);
            event.detail.complete();
        },
        [queryClient]
    );

    const activeGroups = groupDetails?.data?.length ?? 0;
    const totalSpend = groupDetails?.data?.reduce((sum, g) => sum + Number(g.target_amount), 0) ?? 0;
    const hasGroups = Boolean(groupDetails?.data && groupDetails.data.length > 0);

    return (
        <IonPage>
            <HeaderBox
                title={`Hi, ${user?.first_name} 👋`}
                subTitle="Welcome to SmallSave"
                image={user?.profile_pic}
                showBack={false}
                actions={[
                    {
                        key: "notifications",
                        slot: "end",
                        element: (
                            <button
                                className="flex items-center justify-center w-9 h-9 rounded-full text-primary-contrast shrink-0"
                                onClick={() => history.push("/notifications")}
                            >
                                <IonIcon icon={ellipsisVertical} className="text-xl" />
                            </button>
                        )
                    }
                ]}
            >
                {hasGroups && (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-primary-tint rounded-md px-4 py-3">
                            <p className="text-primary-contrast/60 text-xs m-0 mb-1">Total due</p>
                            <p className="text-primary-contrast text-xl m-0">
                                $ {totalSpend.toLocaleString()}
                            </p>
                        </div>

                        <div className="bg-primary-tint rounded-md px-4 py-3">
                            <p className="text-primary-contrast/60 text-xs m-0 mb-1">Active Groups</p>
                            <div className="flex items-center gap-1.5">
                                <IonIcon icon={peopleOutline} className="text-primary-contrast text-xl" />
                                <p className="text-primary-contrast text-xl m-0">{activeGroups}</p>
                            </div>
                        </div>
                    </div>
                )}
            </HeaderBox>

            <IonContent>
                {/* Summary cards — only visible when groups exist */}
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent />
                </IonRefresher>

                {isLoading ? (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <IonSpinner name="crescent" />
                    </div>
                ) : hasGroups ? (
                    <div>
                        {groupDetails!.data!.map((group) => (
                            <GroupCard key={group.id} group={group} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full px-8 text-center space-y-6">
                        <div className="text-4xl ">Save Together, Grow Together.</div>
                        <div className="text-lg">Ready to Start Saving ?</div>
                        <div className="text-primary/50 text-sm">
                            Create your first saving group and invite members to join your financial journey.
                        </div>
                    </div>
                )}

                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton routerLink="/group/new" color="primary">
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>
            </IonContent>

            <BottomNav />
        </IonPage>
    );
};

export default Home;
