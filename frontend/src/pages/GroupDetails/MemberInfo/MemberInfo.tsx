import React from "react";

import { IonCard, IonCardContent, IonIcon, IonProgressBar, IonText } from "@ionic/react";
import { peopleOutline, timeOutline } from "ionicons/icons";

import "./MemberInfo.css";

interface MemberInfoProps {
    currentMembers: number;
    totalSize: number;
    start_date: string | null;
}

const MemberInfo: React.FC<MemberInfoProps> = ({ currentMembers, totalSize, start_date }) => {
    const remainingMembers = totalSize - currentMembers;
    const progress = totalSize > 0 ? currentMembers / totalSize : 0;
    const getDaysUntilStart = (startDate: string) => {
        const today = new Date();
        const start = new Date(startDate);

        // Remove time part to avoid off-by-one issues
        today.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);

        const diffTime = start.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    };

    return (
        <IonCard className="member-info-card">
            <IonCardContent>
                <IonText className="member-info-title">
                    <h3>Group Setup Complete!</h3>
                </IonText>
                <p style={{ fontSize: "10px" }}>waiting to start on {start_date}</p>
                <div className="member-info-row">
                    <IonIcon icon={timeOutline} />

                    <div className="member-info-text">
                        <IonText>
                            <p>Days until start</p>
                        </IonText>

                        <IonText color="light">
                            <small>
                                {start_date
                                    ? (() => {
                                          const daysLeft = getDaysUntilStart(start_date);
                                          if (daysLeft > 0) {
                                              return `${daysLeft} day${daysLeft > 1 ? "s" : ""} remaining`;
                                          }
                                          if (daysLeft === 0) return "Starting today";
                                          return "Already started";
                                      })()
                                    : "Start date not set"}
                            </small>
                        </IonText>
                    </div>
                </div>

                <div className="member-info-progress">
                    <div className="progress-text">
                        <IonText>
                            <small>Members Joined</small>
                        </IonText>
                        <IonText>
                            <small>
                                {currentMembers}/{totalSize} Joined
                            </small>
                        </IonText>
                    </div>

                    <IonProgressBar value={progress}></IonProgressBar>
                </div>
                <div className="member-info-invite">
                    <IonIcon icon={peopleOutline} />
                    <IonText>
                        <p>
                            Invite {remainingMembers} more member
                            {remainingMembers !== 1 ? "s" : ""} to complete the group
                        </p>
                    </IonText>
                </div>
            </IonCardContent>
        </IonCard>
    );
};

export default MemberInfo;
