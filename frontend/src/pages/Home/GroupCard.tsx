import React from "react";
import { IonCard, IonCardContent, IonGrid, IonRow, IonCol, IonAvatar, IonIcon } from "@ionic/react";
import { personOutline, homeOutline,calendarClearOutline, peopleOutline } from "ionicons/icons";
import { Group } from "../../types";
import profileImageTemp from "../../assets/images/profileImageTemp.jpg";

interface GroupCardProps {
  group: Group;
}

const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
  const progress = Math.min((group.members.length / group.size) * 100, 100);

  return (
    <IonCard style={{ marginBottom: "15px", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
  <IonCardContent>
    <IonGrid>
      <IonRow className="ion-align-items-center" style={{ marginBottom: "10px" }}>
        <IonCol size="3">
          <IonAvatar>
            <img src={profileImageTemp} alt={group.name} />
          </IonAvatar>
        </IonCol>
        <IonCol size="9">
          <h5 style={{ margin: 0 }}>{group.name}</h5>
          <IonIcon icon={peopleOutline} style={{  fontSize: "14px", marginRight: "5px"}} />
          {group.members.length} members &nbsp;&nbsp;
          <IonIcon icon={calendarClearOutline} style={{  fontSize: "14px",  marginRight: "5px"}} />
          {group.duration}/{group.duration} Months
          <p style={{ margin: 0, fontWeight: "bold" }}>₹{group.target_amount}</p>
        </IonCol>
      </IonRow>

      {/* Progress Bar */}
      <IonRow>
        <IonCol>
            <div style={{display:"flex",justifyContent:"space-between"}}>
                <small>progress</small>
                <small>{progress}%</small>
            </div>
          <div style={{ height: "6px", width: "100%", backgroundColor: "#e0e0e0", borderRadius: "3px" }}>
            <div style={{
              width: `${progress}%`,
              height: "6px",
              backgroundColor: "#4caf50",
              borderRadius: "3px"
            }} />
          </div>
        </IonCol>
      </IonRow>
    </IonGrid>
  </IonCardContent>
</IonCard>
  );
};

export default GroupCard;
