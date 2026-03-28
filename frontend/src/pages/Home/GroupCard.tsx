import React, { useCallback } from "react";

import { IonAvatar, IonCard, IonCardContent, IonCol, IonGrid, IonIcon, IonRow, useIonRouter } from "@ionic/react";
import { calendarClearOutline, peopleOutline } from "ionicons/icons";

import "./Home.css";

import profileImageTemp from "assets/images/profileImageTemp.jpg";
import { Group } from "types";

interface GroupCardProps {
    group: Group;
}

const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
    const ionRouter = useIonRouter();

    const progress = Math.min((group.members.length / group.size) * 100, 100);

    const handleOnclick = useCallback(() => {
        try {
            ionRouter.push(`/group/${group.id}/bidding`, "forward");
        } catch (error) {
            console.error("Navigation error:", error);
        }
    }, [group, ionRouter]);

    return (
        <IonCard className="group-card" onClick={handleOnclick}>
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
