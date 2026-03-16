import React, { useContext, useEffect, useState } from "react";
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonAvatar,
    IonFab,
    IonFabButton,
    IonIcon,
    IonFooter
} from "@ionic/react";
import { add, homeOutline, home, notificationsOutline, personOutline, ellipsisVertical } from "ionicons/icons";
import profileImageTemp from "assets/images/profileImageTemp.jpg";
import { BaseResponse, Group } from "types";
import GroupCard from "./GroupCard";
import { useHistory, useLocation } from "react-router-dom";
import "./Home.css";
import { AuthContext } from "contexts/AuthProvider";
import { fetchUserGroups } from "pages/CreateGroup/services";

const Home: React.FC = () => {
    const { user } = useContext(AuthContext)!;
    const [groupDetails, setGroupDetails] = useState<BaseResponse<Group[]> | null>(null);

    // TODO:  change this to tenStackQuery
    const fetchGroupDetails = async () => {
        const response = await fetchUserGroups();
        setGroupDetails(response);
    };

    useEffect(() => {
        fetchGroupDetails();
    }, []);
    const activeGroups = groupDetails?.data?.length || 0;
    const location = useLocation();
    const isHome = location.pathname === "/home";
    const history = useHistory();
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

            <IonFooter>
                <IonToolbar>
                    <IonGrid>
                        <IonRow className="ion-text-center">
                            <IonCol>
                                <IonIcon icon={isHome ? home : homeOutline} size="large" />
                                <p>Home</p>
                            </IonCol>
                            <IonCol>
                                <IonIcon icon={notificationsOutline} size="large" />
                                <p>Notifications</p>
                            </IonCol>
                            <IonCol onClick={() => history.push("/account")}>
                                <IonIcon icon={personOutline} size="large" />
                                <p>Account</p>
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </IonToolbar>
            </IonFooter>
        </IonPage>
    );
};

export default Home;
