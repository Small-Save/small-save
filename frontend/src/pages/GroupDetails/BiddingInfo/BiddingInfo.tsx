import React from "react";

import { IonCard, IonCardContent, IonIcon } from "@ionic/react";
import { trophyOutline, walletOutline } from "ionicons/icons";

import "./BiddingInfo.css";

interface BiddingInfoProps {
    amount: number;
    roundWinner: string;
    paidCount: number;
    totalMembers: number;
}

const BiddingInfo: React.FC<BiddingInfoProps> = ({ amount, roundWinner, paidCount, totalMembers }) => {
    // Calculate the percentage for the progress bar
    const progressPercentage = totalMembers > 0 ? (paidCount / totalMembers) * 100 : 0;

    return (
        <IonCard className="bidding-info-card">
            <IonCardContent className="bidding-info-content">
                {/* Top Header Row */}
                <div className="bidding-header">
                    <div className="current-round-badge">Current Round</div>
                    <div className="wallet-icon-box">
                        <IonIcon icon={walletOutline} className="wallet-icon" />
                    </div>
                </div>

                {/* Amount Section */}
                <div className="amount-section">
                    <h1 className="pool-amount">
                        ₹{amount?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </h1>
                    <p className="pool-subtitle">Total Pool Accumulated</p>
                </div>

                {/* Winner Section */}
                <div className="winner-section">
                    <div className="winner-icon-circle">
                        <IonIcon icon={trophyOutline} className="trophy-icon" />
                    </div>
                    <div className="winner-details">
                        <span className="winner-label">ROUND WINNER</span>
                        <span className="winner-name">{roundWinner}</span>
                    </div>
                </div>

                {/* Collection Progress Section */}
                <div className="progress-section">
                    <div className="progress-labels">
                        <span className="progress-title">COLLECTION PROGRESS</span>
                        <span className="progress-count">
                            {paidCount}/{totalMembers} PAID
                        </span>
                    </div>
                    <div className="progress-bar-container">
                        <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                </div>
            </IonCardContent>
        </IonCard>
    );
};

export default BiddingInfo;
