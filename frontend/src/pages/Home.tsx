import React, { useState } from "react";
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCardHeader, IonCardTitle, IonFab, IonFabButton } from "@ionic/react";
import { IonRouterLink } from "@ionic/react";
import {
  IonFooter,
  IonIcon,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonAvatar,
} from "@ionic/react";
import { colorFill, homeOutline, notificationsOutline, personOutline } from "ionicons/icons";
import profileImageTemp from "../assets/images/profileImageTemp.jpg";
import { ellipsisVertical } from "ionicons/icons";
import { add } from "ionicons/icons"
import { fetchUserGroups } from "../services/groupservice";
import { BaseResponse, Group } from "../types";


const Home: React.FC = () => {
  const userName = "Pranay";
  const activeGroups = 3;
  const totalSpend = 4500;
  const userGroupList: any[]= [];
  const [groupDeatails,setGroupDetails] = useState<BaseResponse<Group[]> | null>(null);
  const fetchGroupDetails = async()  => {
    const response = await fetchUserGroups();
    setGroupDetails(response)
  }


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar  style={{ "--background": "#181729", "--color": "#fff" }} className="ion-padding">
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
            <IonRow>
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Active Groups</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>{activeGroups}</IonCardContent>
              </IonCard>
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>total due</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>{totalSpend}</IonCardContent>
              </IonCard>
            </IonRow>
          </IonGrid>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {userGroupList.length > 0 ? (
    <>
      <h4>Groups</h4>

      {userGroupList.map((group, index) => (
        <IonCard key={index}>
          <IonCardHeader>
            <IonCardTitle>{group}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            This is your group: {group}
          </IonCardContent>
        </IonCard>
      ))}
    </>
  ) : (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h4>Save Together, </h4>
      <h4>Grow Together.</h4>
      <h6>Ready to Start Saving?</h6>
      <p>Create your first saving group and invite members to join your financial journey.</p>
    </div>
  )}
  <IonFab vertical="bottom" horizontal="end" slot="fixed">
    <IonFabButton routerLink="/create-group" color="primary">
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
