import React, { useContext } from "react";

import {
    IonCol,
    IonContent,
    IonFab,
    IonFabButton,
    IonGrid,
    IonHeader,
    IonIcon,
    IonPage,
    IonRow,
    IonToolbar
} from "@ionic/react";
import { useQuery } from "@tanstack/react-query";
import { add, ellipsisVertical } from "ionicons/icons";
import { useHistory } from "react-router-dom";

import GroupCard from "./GroupCard";

import "./Home.css";

import useNotificationStore from "stores/useNotifications";

import BottomNav from "components/BottomNav";
import { ProfilePic } from "components/profilePic";
import { AuthContext } from "contexts/AuthProvider";
import { fetchUserGroups } from "pages/CreateGroup/services";
import { fetchUnreadCount } from "pages/Notifications/services";

const Home: React.FC = () => {
    const { user } = useContext(AuthContext)!;
    const { setUnreadCount } = useNotificationStore();
    const history = useHistory();

    const { data: groupDetails } = useQuery({
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

    const activeGroups = groupDetails?.data?.length || 0;
    const totalSpend = groupDetails?.data?.reduce((sum, group) => sum + Number(group.target_amount), 0) || 0;

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar className=" home-toolbar ion-padding">
                    <IonGrid>
                        <IonRow className="ion-align-items-center">
                            <IonCol size="3">
                                <ProfilePic src={user?.profile_pic} variant="circle" />
                            </IonCol>
                            <IonCol size="8">
                                <h6>Hi, {user?.username}</h6>
                                Welcome to SmallSave
                            </IonCol>
                            <IonCol size="1">
                                <IonIcon icon={ellipsisVertical} className="header-menu-icon" />
                            </IonCol>
                        </IonRow>

                        {groupDetails?.data && groupDetails.data.length > 0 && (
                            <IonRow className="summary-row">
                                <IonCol size="6" className="summary-col-right">
                                    <div className="summary-card">
                                        <div className="summary-label">Total Due</div>
                                        <div className="summary-value">${totalSpend}</div>
                                    </div>
                                </IonCol>

                                <IonCol size="6" className="summary-col-left">
                                    <div className="summary-card">
                                        <div className="summary-label">Active Groups</div>
                                        <div className="summary-value">{activeGroups}</div>
                                    </div>
                                </IonCol>
                            </IonRow>
                        )}
                    </IonGrid>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                {groupDetails?.data && groupDetails.data.length > 0 ? (
                    <>
                        <h3>Groups</h3>
                        {groupDetails.data.map((group) => (
                            <GroupCard key={group.id} group={group} />
                        ))}
                    </>
                ) : (
                    <div className="empty-state">
                        <h4>Save Together,</h4>
                        <h4>Grow Together.</h4>
                        <h6>Ready to Start Saving?</h6>
                        <p>Create your first saving group and invite members to join your financial journey.</p>
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
