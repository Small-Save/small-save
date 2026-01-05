import React, { useEffect, useState } from "react";
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonGrid, IonRow, IonCol, IonAvatar, IonFab, IonFabButton, IonIcon, IonFooter
} from "@ionic/react";
import { add, homeOutline, notificationsOutline, personOutline, ellipsisVertical } from "ionicons/icons";
import profileImageTemp from "../../assets/images/profileImageTemp.jpg";
import { fetchUserGroups } from "../../services/groupservice";
import { BaseResponse, Group } from "../../types";
import GroupCard from "./groupCard";

const Home: React.FC = () => {
  const userName = "Pranay";
  const [groupDetails, setGroupDetails] = useState<BaseResponse<Group[]> | null>(null);
  const fetchGroupDetails = async () => {
    const response = await fetchUserGroups();
    setGroupDetails(response);
  };

  useEffect(() => {
    fetchGroupDetails();
  }, []);
  const activeGroups = groupDetails?.data?.length || 0;
  const totalSpend = groupDetails?.data?.reduce((sum, group) => sum + Number(group.target_amount), 0) || 0;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ "--background": "#181729", "--color": "#fff" }} className="ion-padding">
          <IonGrid>
            <IonRow className="ion-align-items-center">
              <IonCol size="3">
                <IonAvatar>
                  <img src={profileImageTemp} alt="Profile" />
                </IonAvatar>
              </IonCol>
              <IonCol size="8">
                <h6>Hi, {userName}</h6>
                Welcome to SmallSave
              </IonCol>
              <IonCol size="1">
                <IonIcon icon={ellipsisVertical} style={{ color: "white", fontSize: "24px" }} />
              </IonCol>
            </IonRow>

            {groupDetails?.data && groupDetails.data.length > 0 && (
  <IonRow
    style={{
      marginTop: "16px",
      padding: "0 12px",
      display: "flex",
      justifyContent: "space-between",
    }}
  >
    <IonCol size="6" style={{ paddingRight: "8px" }}>
      <div
        style={{
          background: "#2A2A3D",
          borderRadius: "16px",
          padding: "16px",
          color: "white",
          boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ fontSize: "14px", opacity: 0.8 }}>Total Due</div>
        <div style={{ fontSize: "22px", fontWeight: "bold", marginTop: "6px" }}>
          ${totalSpend}
        </div>
      </div>
    </IonCol>

    <IonCol size="6" style={{ paddingLeft: "8px" }}>
      <div
        style={{
          background: "#2A2A3D",
          borderRadius: "16px",
          padding: "16px",
          color: "white",
          boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ fontSize: "14px", opacity: 0.8 }}>Active Groups</div>
        <div style={{ fontSize: "22px", fontWeight: "bold", marginTop: "6px" }}>
          {activeGroups}
        </div>
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
    <div style={{ textAlign: "center", marginTop: "40px" }}>
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
                <IonIcon icon={homeOutline} size="large" />
                <p>Home</p>
              </IonCol>
              <IonCol>
                <IonIcon icon={notificationsOutline} size="large" />
                <p>Notifications</p>
              </IonCol>
              <IonCol>
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
