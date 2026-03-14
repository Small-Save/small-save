import React from "react";
import { IonIcon } from "@ionic/react";
import { trophy, receiptOutline } from "ionicons/icons";
import "./History.css";

// Updated Props to match the new Round interface
interface HistoryCardProps {
  round?: {
    round_number: number;
    winner: string;
    scheduled_time: string;
  };
  onClick?: () => void;
  isEmpty?: boolean;
}

const HistoryCard: React.FC<HistoryCardProps> = ({ 
  round, 
  onClick, 
  isEmpty = false 
}) => {
  
  // 1. Empty State
  if (isEmpty || !round) {
    return (
      <div className="history-empty-state">
        <div className="empty-icon-wrapper">
          <IonIcon icon={receiptOutline} className="empty-icon" />
        </div>
        <h3 className="empty-title">No Payment History Yet</h3>
        <p className="empty-subtitle">
          When rounds are completed, their transaction records will appear here.
        </p>
      </div>
    );
  }

  // 2. Standard Card using new direct properties
  return (
    <div className="history-card" onClick={onClick}>
      <div className="history-icon-wrapper">
        <IonIcon icon={trophy} className="history-icon" />
      </div>
      
      <div className="history-details">
        <h3 className="history-round-name">Round {round.round_number}</h3>
        <p className="history-winner">Winner: {round.winner}</p>
        <p className="history-date">
          {new Date(round.scheduled_time).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default HistoryCard;