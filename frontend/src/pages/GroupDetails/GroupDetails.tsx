import React, { useContext, useEffect, useState } from "react";
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
  IonText,
  IonSpinner
} from "@ionic/react";
import { settingsOutline, ellipsisHorizontalCircleOutline, chevronBackCircleOutline, personAddOutline, diamondOutline } from "ionicons/icons";
import { useHistory } from "react-router";
import "./GroupDetail.css";
import { fetchUserGroups } from "pages/CreateGroup/services";
import { fetchCurrentPaymentStatus, fetchGroupPaymentHistory, confirmReceiverPayment } from "services/payments"; // Import receiver API if needed later
import { BaseResponse, Group, GroupPaymentHistoryResponse, paymentStatus } from "types";
import BiddingInfo from "./BiddingInfo/BiddingInfo";
import MemberInfo from "./MemberInfo/MemberInfo";
import Status from "./Status/Status";
import { AuthContext } from "contexts/AuthProvider";
import HistoryCard from "./History/History";
import RoundTransactions from "./History/RoundTransactions/RoundTransactions";

const GroupDetail: React.FC = () => {
  const { user } = useContext(AuthContext)!;
  const history = useHistory();

  const [activeRoundView, setActiveRoundView] = useState<{ name: string, data: paymentStatus[] } | null>(null);
  const [selectedOption, setSelectedOption] = useState<"Overview" | "Status" | "History">("Overview");
  const [showOptions, setShowOptions] = useState(false);

  const groupOptions = ["Overview", "Status", "History"] as const;

  // Group Details State
  const [groupDetails, setGroupDetails] = useState<BaseResponse<Group[]> | null>(null);
  const fetchGroupDetails = async () => {
    const response = await fetchUserGroups();
    setGroupDetails(response);
  };

  useEffect(() => {
    fetchGroupDetails();
  }, []);

  // Payment Status State
  const [paymentStatus, setPaymentStatus] = useState<BaseResponse<paymentStatus> | null>(null);
  const getCurrentPaymentStatus = async () => {
    const response = await fetchCurrentPaymentStatus(11,1); // Added {} assuming it might expect optional params based on previous setup
    setPaymentStatus(response);
  }

  useEffect(() => {

    getCurrentPaymentStatus();
  }, [])

  // Payment History State
  const [paymentHistory, setPaymentHistory] = useState<BaseResponse<GroupPaymentHistoryResponse> | null>(null);
  const getPaymentHistory = async () => {
    try {
      const response = await fetchGroupPaymentHistory(11);
      setPaymentHistory(response);
    } catch (error) {
      console.error("Failed to fetch payment history", error);
    }
  };

  useEffect(() => {
    getPaymentHistory();
  }, []);

  // --- NEW: Handle Confirm Payment Logic ---
  const handleConfirmPayment = async (paymentId: number) => {
    try {
      // 1. Call the API (Note: If this is for the receiver, you might want to swap this to confirmReceiverPayment)
      await confirmReceiverPayment(paymentId);
      
      // 2. Refresh the payment status data
      await getCurrentPaymentStatus();
      
      // 3. Ensure the Status tab is actively selected
      setSelectedOption("Status");
      
    } catch (error) {
      console.error("Failed to confirm payment", error);
      // You can add an Ionic Toast here later to show the error to the user
    }
  };

  const group = groupDetails?.data?.[0];
  const {
    size = 0,
    members = [],
    start_date = null,
  } = group ?? {};

  const groupMemberSize = members.length;
  const isGroupFull = size === groupMemberSize;
  
  const receiverInfo = paymentStatus?.data?.payments[0];
  
  // Checking if the logged-in user is the receiver
  const isReceiver = receiverInfo?.receiver_name === user?.user_name && receiverInfo?.receiver === user?.id;
  
  const fetchuserPaymentID = () => {
    if(!isReceiver) {
      const id = paymentStatus?.data?.payments.map(t => t.giver === user?.id)
      return id;
    }
    return null;

  }

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
            {group?.name}
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
          <BiddingInfo />
        ) : (
          <MemberInfo
            currentMembers={groupMemberSize}
            totalSize={size}
            start_date={start_date}
          />
        )}
        
        <div className="action-button">
          {!isGroupFull ? (
            <IonButton onClick={() => history.push("/payment/7")}>
              Make payment
            </IonButton>
          ) : (
            <IonButton className="invite-button">
              <IonIcon icon={personAddOutline} />
              <div className="button-text">
                <p>Invite Members</p>
                <small style={{ marginLeft: '12px' }}>Share your group code</small>
              </div>
            </IonButton>
          )}
          <IonButton className="pool-button">
            <IonIcon icon={diamondOutline}></IonIcon>
            <div className="button-text">
              <p>Pool system</p>
              <small style={{ marginLeft: '12px' }}>Winner selection</small>
            </div>
          </IonButton>
        </div>

        {/* Group Options Section */}
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
          
          <div className="group-option-card">
            {selectedOption === "Overview" && (
              <IonText>
                <p>Overview content goes here</p>
              </IonText>
            )}

            {selectedOption === "Status" && (
              <Status
                isReceiver={true} // Passes the dynamic variable we calculated above
                onConfirmPayment={handleConfirmPayment} // Hooks up the API call
                payments={paymentStatus?.data?.payments ?? []} 
              />
            )}

            {selectedOption === "History" && (
  <div className="history-list-scroll-container">
    {!paymentHistory ? (
      <div className="loading-container">
        <IonSpinner name="crescent" />
      </div>
    ) : /* 1. Check if the array is empty */
    (paymentHistory.data?.rounds?.length ?? 0) === 0 ? (
      <HistoryCard isEmpty={true} />
    ) : (
      /* 2. Map through the array directly */
      paymentHistory.data!.rounds.map((round) => {
        return (
          // Inside GroupDetail.tsx where you map the history cards:

<HistoryCard 
  key={round.round_number}
  round={round} 
  onClick={() => {
    // Navigate to the Round Transactions page and pass lightweight data
    history.push("/round-transactions", {
      roundNumber: round.round_number,
      groupName: group?.name || "Group"
    });
  }}
/>
        );
      })
    )}
  </div>
)}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default GroupDetail;