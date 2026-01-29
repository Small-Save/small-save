import React from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle,
  IonContent
} from "@ionic/react";
import { settingsOutline, chevronBackCircleOutline } from "ionicons/icons";
import { useHistory } from "react-router";
import "./GroupDetail.css";

const GroupDetail: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="group-header">
          <IonButtons slot="start">
            <IonButton onClick={() => history.goBack()}>
              <IonIcon icon={chevronBackCircleOutline} />
            </IonButton>
          </IonButtons>

          <IonTitle className="group-title">
            My Group Name
          </IonTitle>

          <IonButtons slot="end">
            <IonButton>
              <IonIcon icon={settingsOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Page content */}
      </IonContent>
    </IonPage>
  );
};
export default GroupDetail;