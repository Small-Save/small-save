import React from "react";
import { IonCard, IonCardContent, IonGrid, IonRow, IonCol, IonAvatar, IonIcon } from "@ionic/react";
import { calendarClearOutline, peopleOutline } from "ionicons/icons";
import "./Home.css";
import profileImageTemp from "assets/images/profileImageTemp.jpg";
import { Group } from "types";

interface GroupCardProps {
    group: Group;
}

const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
    const progress = Math.min((group.members.length / group.size) * 100, 100);

    return (
        <IonCard className="group-card">
            <IonCardContent>
                <IonGrid>
                    <IonRow className="ion-align-items-center group-row-margin">
                        <IonCol size="3">
                            <IonAvatar>
                                <img src={profileImageTemp} alt={group.name} />
                            </IonAvatar>
                        </IonCol>

                        <IonCol size="9">
                            <h5 className="group-title">{group.name}</h5>
                            <IonIcon icon={peopleOutline} className="group-icon" />
                            {group.members.length} members &nbsp;&nbsp;
                            <IonIcon icon={calendarClearOutline} className="group-icon" />
                            {group.duration}/{group.duration} Months
                            <p className="group-amount">₹{group.target_amount}</p>
                        </IonCol>
                    </IonRow>

                    {/* Progress Bar */}
                    <IonRow>
                        <IonCol>
                            <div className="progress-header">
                                <small>progress</small>
                                <small>{progress}%</small>
                            </div>

                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${progress}%` }} />
                            </div>
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonCardContent>
        </IonCard>
    );
};

export default GroupCard;
