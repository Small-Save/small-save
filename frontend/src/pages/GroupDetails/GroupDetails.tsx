import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonText
} from "@ionic/react";
import { settingsOutline,ellipsisHorizontalCircleOutline, chevronBackCircleOutline, personAddOutline, diamondOutline } from "ionicons/icons";
import { useHistory } from "react-router";
import "./GroupDetail.css";
import { fetchUserGroups } from "pages/CreateGroup/services";
import { BaseResponse, Group } from "types";
import BiddingInfo from "./BiddingInfo/BiddingInfo";
import MemberInfo from "./MemberInfo/MemberInfo";

const GroupDetail: React.FC = () => {
    const [groupDetails, setGroupDetails] = useState<BaseResponse<Group[]> | null>(null);
        const fetchGroupDetails = async () => {
            const response = await fetchUserGroups();
            setGroupDetails(response);
        };
    
        useEffect(() => {
            fetchGroupDetails();
        }, []);
   const [selectedOption, setSelectedOption] = useState<
  "Overview" | "Status" | "History"
>("Overview");

const [showOptions, setShowOptions] = useState(false);
  const groupOptions = ["Overview", "Status", "History"] as const;
  const history = useHistory();
  const group = groupDetails?.data?.[0];
 const {
  size = 0,
  members = [],
  start_date = null,
} = group ?? {};

const groupMemberSize = members.length;
const isGroupFull = size === groupMemberSize;
const groupStartDate = start_date;


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
            {/* Need to the current round of info */}
          </IonTitle>

          <IonButtons slot="end">
            <IonButton>
              <IonIcon icon={settingsOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
         {isGroupFull ? (
          <BiddingInfo 
        //    group={group} 

        />
        ) : (
          <MemberInfo
            currentMembers={groupMemberSize}
            totalSize={size}
            start_date = {start_date}
          />
        )}
        <div className="action-button">
            {isGroupFull ? (<IonButton>Make payment</IonButton>): (<IonButton className="invite-button"><IonIcon icon={personAddOutline} /><div className="button-text"><p>Invite Members</p><small style={{marginLeft:'12px'}}>Share your group code</small>
                </div></IonButton>)}
            <IonButton className="pool-button"> <IonIcon icon={diamondOutline}></IonIcon>
            <div className="button-text">
                <p>Pool system</p>
                <small style={{marginLeft:'12px'}}>Winner selection</small>
            </div>
            </IonButton>
        </div>
        {/* Group Options Section */}
{/* Group Options Dropdown */}
<div className="group-options">

  {/* Header */}
  <div className="group-option-header">
    <IonText>
      <h3>{selectedOption}</h3>
    </IonText>

    <IonIcon
      icon={ellipsisHorizontalCircleOutline}
      className="option-icon"
      onClick={() => setShowOptions(!showOptions)}
    />
  </div>

  {/* Dropdown */}
  {showOptions && (
    <IonCard className="group-option-dropdown">
      <IonCardContent>
        {groupOptions.map((option) => (
          <div
            key={option}
            className="dropdown-item"
            onClick={() => {
              setSelectedOption(option);
              setShowOptions(false);
            }}
          >
            <IonText>{option}</IonText>
          </div>
        ))}
      </IonCardContent>
    </IonCard>
  )}
  <IonCard className="group-option-card">
    <IonCardContent>
      {selectedOption === "Overview" && (
        <IonText>
          <p>Overview content goes here</p>
        </IonText>
      )}

      {selectedOption === "Status" && (
        <IonText>
          <p>Status content goes here</p>
        </IonText>
      )}

      {selectedOption === "History" && (
        <IonText>
          <p>History content goes here</p>
        </IonText>
      )}
    </IonCardContent>
  </IonCard>
</div>
      </IonContent>
    </IonPage>
  );
};
export default GroupDetail;