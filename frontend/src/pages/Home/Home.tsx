import React, { useContext, useEffect, useState } from "react";

import {
    IonAvatar,
    IonCol,
    IonContent,
    IonFab,
    IonFabButton,
    IonFooter,
    IonGrid,
    IonHeader,
    IonIcon,
    IonPage,
    IonRow,
    IonToolbar
} from "@ionic/react";
import {
    add,
    ellipsisVertical,
    home,
    homeOutline,
    notifications,
    notificationsOutline,
    person,
    personOutline
} from "ionicons/icons";
import { useHistory, useLocation } from "react-router-dom";

import profileImageTemp from "assets/images/profileImageTemp.jpg";
import { BaseResponse, Group } from "types";

import GroupCard from "./GroupCard";

import "./Home.css";

import { AuthContext } from "contexts/AuthProvider";
import { toast } from "Hooks/useToast";
import { fetchUserGroups } from "pages/CreateGroup/services";

const Home: React.FC = () => {
    const { user } = useContext(AuthContext)!;
    const history = useHistory();
    const [groupDetails, setGroupDetails] = useState<BaseResponse<Group[]> | null>(null);
    const isActive = (path: string) => location.pathname === path;
    // Navigation Handler
    const goTo = (path: string) => {
        if (location.pathname !== path) {
            history.push(path);
        }
    };

    // TODO:  change this to tenStackQuery
    const fetchGroupDetails = async () => {
        try {
            const response = await fetchUserGroups();
            setGroupDetails(response);
        } catch {
            toast({ message: "Failed to load groups.", color: "danger" });
        }
    };

    useEffect(() => {
        fetchGroupDetails();
    }, []);
    const activeGroups = groupDetails?.data?.length || 0;
    const location = useLocation();
    const isHome = location.pathname === "/home";
    const totalSpend = groupDetails?.data?.reduce((sum, group) => sum + Number(group.target_amount), 0) || 0;

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar className=" home-toolbar ion-padding">
                    <IonGrid>
                        <IonRow className="ion-align-items-center">
                            <IonCol size="3">
                                <IonAvatar>
                                    <img src={profileImageTemp} alt="Profile" />
                                </IonAvatar>
                            </IonCol>
                            <IonCol size="8">
                                <h6>Hi, {user?.user_name}</h6>
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

            <IonFooter className="ion-no-border">
                {/* Added a subtle top border and shadow for depth */}
                <IonToolbar className="border-t border-gray-100 shadow-lg" style={{ "--background": "#ffffff" }}>
                    <div className="flex justify-around items-center py-3 px-2">
                        {/* Home Tab */}
                        <button
                            onClick={() => goTo("/home")}
                            className={`flex flex-col items-center gap-1 transition-all duration-200 outline-none ${
                                isActive("/home") ? "text-primary" : "text-gray-400"
                            }`}
                        >
                            <div
                                className={`p-2 rounded-xl transition-colors ${isActive("/home") ? "bg-primary/5" : ""}`}
                            >
                                <IonIcon icon={isActive("/home") ? home : homeOutline} className="text-2xl" />
                            </div>
                            <span className="text-xs uppercase tracking-widest font-extrabold">Home</span>
                        </button>

                        {/* Notifications Tab */}
                        <button
                            onClick={() => goTo("/notifications")}
                            className={`flex flex-col items-center gap-1 transition-all duration-200 outline-none ${
                                isActive("/notifications") ? "text-primary" : "text-gray-400"
                            }`}
                        >
                            <div
                                className={`p-2 rounded-xl transition-colors ${isActive("/notifications") ? "bg-primary/5" : ""}`}
                            >
                                <IonIcon
                                    icon={isActive("/notifications") ? notifications : notificationsOutline}
                                    className="text-2xl"
                                />
                            </div>
                            <span className="text-xs uppercase tracking-widest font-extrabold">
                                Alerts
                            </span>
                        </button>

                        {/* Account Tab */}
                        <button
                            onClick={() => goTo("/account")}
                            className={`flex flex-col items-center gap-1 transition-all duration-200 outline-none ${
                                isActive("/account") ? "text-primary" : "text-gray-400"
                            }`}
                        >
                            <div
                                className={`p-2 rounded-lg transition-colors ${isActive("/account") ? "bg-primary/5" : ""}`}
                            >
                                <IonIcon icon={isActive("/account") ? person : personOutline} className="text-2xl" />
                            </div>
                            <span className="text-xs uppercase tracking-widest font-extrabold">
                                Account
                            </span>
                        </button>
                    </div>
                </IonToolbar>
            </IonFooter>
        </IonPage>
    );
};

export default Home;
