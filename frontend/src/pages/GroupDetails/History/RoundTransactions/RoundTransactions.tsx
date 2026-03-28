import React, { useEffect, useState } from "react";

import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonPage,
    IonSpinner,
    IonTitle,
    IonToolbar
} from "@ionic/react";
import { arrowBackOutline, checkmarkCircle, ribbon } from "ionicons/icons";
import { useHistory, useLocation } from "react-router";
import { fetchCurrentPaymentStatus } from "services/payments";

import profileImageTemp from "assets/images/profileImageTemp.jpg";

import "./RoundTransactions.css";

export interface PaymentItem {
    id: number;
    giver: string;
    giver_name: string;
    receiver: string;
    receiver_name: string;
    amount: string;
    status: "PENDING" | "GIVER_CONFIRMED" | "COMPLETED" | "DUE";
    created_at: string;
}

interface LocationState {
    roundNumber: number;
    groupName: string;
    groupID: number;
}

const RoundTransactions: React.FC = () => {
    const history = useHistory();
    const location = useLocation<LocationState>();

    const roundNumber = location.state?.roundNumber || 1;
    const groupName = location.state?.groupName || "Group";
    const roundName = `Round ${roundNumber}`;
    const groupID = location.state?.groupID || 0;

    const [transactions, setTransactions] = useState<PaymentItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 3. Fetch data on load
    useEffect(() => {
        const loadRoundData = async () => {
            setIsLoading(true);
            try {
                const response = await fetchCurrentPaymentStatus(groupID, roundNumber);
                if (response.is_success && response.data) {
                    setTransactions(response.data.payments);
                }
            } catch (error) {
                console.error("Failed to load round transactions", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadRoundData();
    }, [roundNumber]);
    const totalAmount = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    const paidTransactions = transactions.filter((tx) => tx.status === "COMPLETED");
    const paidCount = paidTransactions.length;
    const totalCount = transactions.length;

    const roundWinner = transactions.length > 0 ? transactions[0].receiver_name : "N/A";

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        const datePart = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        const timePart = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        return `${datePart} • ${timePart}`;
    };

    // 5. Loading State UI
    if (isLoading) {
        return (
            <IonPage>
                <IonHeader className="ion-no-border">
                    <IonToolbar className="round-header">
                        <IonButtons slot="start">
                            <IonButton onClick={() => history.goBack()}>
                                <IonIcon icon={arrowBackOutline} className="back-icon" />
                            </IonButton>
                        </IonButtons>
                        <IonTitle className="round-title">{roundName} Transactions</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="round-content ion-text-center">
                    <div style={{ marginTop: "40vh" }}>
                        <IonSpinner name="crescent" color="primary" />
                        <p style={{ color: "#64748b", marginTop: "16px" }}>Loading transactions...</p>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    // 6. Main UI
    return (
        <IonPage>
            <IonHeader className="ion-no-border">
                <IonToolbar className="round-header">
                    <IonButtons slot="start">
                        <IonButton onClick={() => history.goBack()}>
                            <IonIcon icon={arrowBackOutline} className="back-icon" />
                        </IonButton>
                    </IonButtons>
                    <IonTitle className="round-title">{roundName} Transactions</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="round-content">
                <div className="round-container">
                    <div className="hero-card">
                        <div className="hero-card-bg-shape"></div>
                        <p className="pool-status-label">{groupName.toUpperCase()} POOL</p>
                        <h1 className="pool-amount">
                            ₹
                            {totalAmount.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </h1>

                        <div className="hero-divider"></div>

                        <div className="hero-stats">
                            <div className="stat-box">
                                <span className="stat-label">Collection Progress</span>
                                <span className="stat-value">
                                    {paidCount}/{totalCount} Paid
                                </span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-label">Round Winner</span>
                                <span className="stat-value winner-name">
                                    <IonIcon icon={ribbon} className="winner-icon" />
                                    {roundWinner}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="transactions-header">
                        <h2>Transaction History</h2>
                        <div className="tx-count-badge">{totalCount} Payments</div>
                    </div>

                    <div className="transactions-list">
                        {transactions.map((tx) => {
                            const isPaid = tx.status === "COMPLETED";

                            return (
                                <div className="tx-card" key={tx.id}>
                                    <div className="tx-avatar">
                                        <img src={profileImageTemp} alt="Profile" />
                                    </div>

                                    <div className="tx-details">
                                        <h3 className="tx-name">{tx.giver_name}</h3>
                                        <p className="tx-date">{formatDate(tx.created_at)}</p>
                                        <p className="tx-amount">₹{parseFloat(tx.amount).toLocaleString()}</p>
                                    </div>

                                    <div className="tx-status-col">
                                        <span className={`status-badge ${isPaid ? "paid" : "pending"}`}>
                                            {isPaid ? "PAID" : tx.status.replace("_", " ")}
                                        </span>
                                        {isPaid && <IonIcon icon={checkmarkCircle} className="paid-check-icon" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default RoundTransactions;
