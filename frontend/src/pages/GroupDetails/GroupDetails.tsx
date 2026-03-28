import React, { useCallback, useContext, useEffect, useState } from "react";

import {
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonIcon,
    IonPage,
    IonSpinner,
    IonText,
    IonTitle,
    IonToolbar
} from "@ionic/react";
import {
    checkmarkDoneOutline,
    chevronBackCircleOutline,
    diamondOutline,
    ellipsisHorizontalCircleOutline,
    personAddOutline,
    readerOutline,
    settingsOutline,
    timeOutline
} from "ionicons/icons";
import { useHistory, useParams } from "react-router";

import "./GroupDetail.css";

import { confirmReceiverPayment, fetchCurrentPaymentStatus, fetchGroupPaymentHistory } from "services/payments"; // Import receiver API if needed later

import { AuthContext } from "contexts/AuthProvider";
import { fetchUserGroups } from "pages/CreateGroup/services";
import { BaseResponse, Group, GroupPaymentHistoryResponse, paymentStatus } from "types";

import BiddingInfo from "./BiddingInfo/BiddingInfo";
import HistoryCard from "./History/History";
import RoundTransactions from "./History/RoundTransactions/RoundTransactions";
import MemberInfo from "./MemberInfo/MemberInfo";
import Status from "./Status/Status";

const GroupDetail: React.FC = () => {
    const { user } = useContext(AuthContext)!;
    const history = useHistory();
    const { groupId } = useParams<{ groupId: string; groupName: string }>();

    const [selectedOption, setSelectedOption] = useState<"Overview" | "Status" | "History">("Overview");
    const [showOptions, setShowOptions] = useState(false);

    const groupOptions: { value: "Overview" | "Status" | "History"; icon: string }[] = [
        { value: "Overview", icon: readerOutline },
        { value: "Status", icon: checkmarkDoneOutline },
        { value: "History", icon: timeOutline }
    ];

    const [groupDetails, setGroupDetails] = useState<BaseResponse<Group[]> | null>(null);
    const fetchGroupDetails = async () => {
        const response = await fetchUserGroups();
        setGroupDetails(response);
    };

    useEffect(() => {
        const fetchGroupDetails = async () => {
            try {
                const response = await fetchUserGroups();
                setGroupDetails(response);
            } catch (error) {
                console.error("Failed to fetch group details", error);
            }
        };
        fetchGroupDetails();
    }, []);

    // Payment History State
    const [paymentHistory, setPaymentHistory] = useState<BaseResponse<GroupPaymentHistoryResponse> | null>(null);
    const paymentData = paymentHistory?.data?.rounds
        .filter((round) => round.winner !== null)
        .sort((a, b) => a.round_number - b.round_number); // remove rounds which are not completed and sort them in ascending to

    useEffect(() => {
        const getPaymentHistory = async () => {
            try {
                const response = await fetchGroupPaymentHistory(Number(groupId));
                setPaymentHistory(response);
            } catch (error) {
                console.error("Failed to fetch payment history", error);
            }
        };
        getPaymentHistory();
    }, [groupId]);

    // Group Details
    const group = groupDetails?.data?.find((g) => g.id === Number(groupId));

    // Payment Status State
    const [paymentStatus, setPaymentStatus] = useState<BaseResponse<paymentStatus> | null>(null);

    const getCurrentPaymentStatus = async () => {
        // Safely get the round number, falling back to the group's latest round or 1
        const currentRoundId =
            paymentData?.[paymentData.length - 1]?.round_number || group?.latest_bidding_round_id || 1;
        try {
            const response = await fetchCurrentPaymentStatus(Number(groupId), Number(currentRoundId));
            setPaymentStatus(response);
        } catch (error) {
            console.error("Failed to fetch payment status", error);
        }
    };

    useEffect(() => {
        // Wait for the dependencies to load before fetching the payment status
        if (paymentHistory && groupDetails) {
            getCurrentPaymentStatus();
        }
    }, [paymentHistory, groupDetails]);

    // --- NEW: Handle Confirm Payment Logic ---
    const handleConfirmPayment = async (paymentId: number) => {
        try {
            await confirmReceiverPayment(paymentId);

            // 2. Refresh the payment status data
            await getCurrentPaymentStatus();

            // 3. Ensure the Status tab is actively selected
            setSelectedOption("Status");
        } catch (error) {
            console.error("Failed to confirm payment", error);
            //TODO: add an Ionic Toast here later to show the error to the user
        }
    };

    const { size = 0, members = [], start_date = null, latest_bidding_round_id = 0 } = group ?? {};

    const groupMemberSize = members.length;
    const isGroupFull = size === groupMemberSize;

    const receiverInfo = paymentStatus?.data?.payments[0];

    // Checking if the logged-in user is the receiver
    const isReceiver = receiverInfo?.receiver_name === user?.user_name && receiverInfo?.receiver === user?.id;

    // Calculate Bidding Info Props
    const currentRoundWinner = receiverInfo?.receiver_name || "N/A";
    const paidCount = paymentStatus?.data?.payments?.filter((p) => p.status === "COMPLETED").length || 0;

    const getGiverPaymentId = () => {
        if (!isReceiver) {
            // Find the specific payment object where the current user is the giver
            const userPayment = paymentStatus?.data?.payments.find((p) => p.giver === user?.id);
            // Return the ID of that payment, or null if not found
            return userPayment ? userPayment.id : null;
        }
        return null;
    };

    const handleOnclick = useCallback(() => {
        try {
            history.push(`/group/${group?.id}/bidding`, "forward");
        } catch (error) {
            console.error("Navigation error:", error);
        }
    }, [group, history]);
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
                        <div className="group-name-text">{group?.name}</div>
                        <IonText className="group-round-text">
                            ROUND {latest_bidding_round_id} OF {size}
                        </IonText>
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
                        amount={Number(group?.target_amount) || 0}
                        roundWinner={currentRoundWinner}
                        paidCount={paidCount}
                        totalMembers={size}
                    />
                ) : (
                    <MemberInfo currentMembers={groupMemberSize} totalSize={size} start_date={start_date} />
                )}

                <div className="action-button">
                    {isGroupFull ? (
                        <IonButton
                            onClick={() => {
                                const paymentId = getGiverPaymentId();
                                if (paymentId) {
                                    history.push(`/payment/${paymentId}`);
                                }
                            }}
                        >
                            Make payment
                        </IonButton>
                    ) : (
                        <IonButton className="invite-button">
                            <IonIcon icon={personAddOutline} />
                            <div className="button-text">
                                <p>Invite Members</p>
                                <small style={{ marginLeft: "12px" }}>Share your group code</small>
                            </div>
                        </IonButton>
                    )}
                    <IonButton className="pool-button" onClick={handleOnclick}>
                        <IonIcon icon={diamondOutline}></IonIcon>
                        <div className="button-text">
                            <p>Pool system</p>
                            <small style={{ marginLeft: "12px" }}>Winner selection</small>
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
                                        key={option.value}
                                        className="dropdown-item"
                                        onClick={() => {
                                            setSelectedOption(option.value);
                                            setShowOptions(false);
                                        }}
                                    >
                                        <IonIcon icon={option.icon} className="dropdown-icon" />
                                        <IonText>{option.value}</IonText>
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
                                isReceiver={isReceiver} // Passes the dynamic variable we calculated above
                                onConfirmPayment={handleConfirmPayment}
                                payments={paymentStatus?.data?.payments ?? []}
                            />
                        )}

                        {selectedOption === "History" && (
                            <div className="history-list-scroll-container">
                                {!paymentHistory ? (
                                    <div className="loading-container">
                                        <IonSpinner name="crescent" />
                                    </div>
                                ) : (paymentData?.length ?? 0) === 0 ? (
                                    <HistoryCard isEmpty={true} />
                                ) : (
                                    paymentData?.map((round) => {
                                        return (
                                            <HistoryCard
                                                key={round.round_number}
                                                round={round}
                                                onClick={() => {
                                                    history.push("/round-transactions", {
                                                        roundNumber: round.round_number,
                                                        groupName: group?.name || "Group",
                                                        groupID: group?.id || 0
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
