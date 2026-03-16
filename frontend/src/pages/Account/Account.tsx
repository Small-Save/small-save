import React, { useContext } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle,
  IonContent,
} from "@ionic/react";
import {
  arrowBackOutline,
  settingsOutline,
  pencil,
  mail,
  call,
  person,
  notifications,
  card,
  lockClosed,
  helpCircle,
  chevronForwardOutline,
  logOutOutline,
} from "ionicons/icons";
import { useHistory } from "react-router";
import "./Account.css";
import { AuthContext } from "contexts/AuthProvider";

const Account: React.FC = () => {
  const history = useHistory();
  const { logout } = useContext(AuthContext)!;

  return (
    <IonPage className="account-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="account-header">
          <IonButtons slot="start">
            <IonButton onClick={() => history.goBack()}>
              <IonIcon icon={arrowBackOutline} className="header-icon" />
            </IonButton>
          </IonButtons>
          <IonTitle className="account-title">Account</IonTitle>
          <IonButtons slot="end">
            <IonButton>
              <IonIcon icon={settingsOutline} className="header-icon" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="account-content">
        <div className="account-container"> 

          {/* Logout Button */}
          <button className="logout-btn" onClick={() => logout()}>
            <IonIcon icon={logOutOutline} className="logout-icon" />
            Logout
          </button>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Account;