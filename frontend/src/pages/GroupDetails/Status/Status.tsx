import React from "react";
import { IonText } from "@ionic/react";
import { payments } from "types"; // Adjust import if needed
import "./Status.css";

interface Props {
  payments: payments[];
  isReceiver: boolean;
  onConfirmPayment?: (paymentId: number) => void; // Pass your API confirm function here
}

const PaymentStatusList: React.FC<Props> = ({ payments, isReceiver, onConfirmPayment }) => {
  if (!payments?.length) {
    return <IonText color="medium" className="empty-state">No payments yet</IonText>;
  }

  // Helper to generate the subtext under the name based on status
  // You can replace this with actual dates if your backend provides them
  const getSubtext = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Collected"; 
      case "DUE":
        return "Overdue";
      case "PENDING":
      case "GIVER_CONFIRMED":
        return "Due soon";
      default:
        return "";
    }
  };

  return (
    <div className="payment-scroll-container">
      {payments.map((payment) => {
        // 1. Check if we should show the Action Button
        const isConfirmable = isReceiver && payment.status === "GIVER_CONFIRMED";

        // 2. Determine Badge Styles & Text
        let badgeClass = "badge-pending";
        let badgeText = "PENDING";

        if (payment.status === "COMPLETED") {
          badgeClass = "badge-paid";
          badgeText = "PAID";
        } else if (payment.status === "DUE") {
          badgeClass = "badge-due";
          badgeText = "DUE";
        } else if (payment.status === "GIVER_CONFIRMED") {
          badgeClass = "badge-pending";
          badgeText = "confirm"; // Shows as pending to the giver until receiver confirms
        }

        return (
          <div key={ payment.id} className="custom-payment-card">
            
            {/* Left Side: Avatar & Info */}
            <div className="card-left">
              <div className="avatar-container">
                <img
                  src={`https://ui-avatars.com/api/?name=${payment.giver_name}&background=E1C8B4&color=fff`}
                  alt={payment.giver_name}
                  className="avatar-img"
                />
              </div>
              
              <div className="card-info">
                <h3 className="user-name">{payment.giver_name}</h3>
                <span className={`sub-text ${payment.status === "DUE" ? "text-danger" : ""}`}>
                  {getSubtext(payment.status)}
                </span>
              </div>
            </div>

            {/* Right Side: Amount & Badge/Button */}
            <div className="card-right">
              <span className="amount-text">₹{payment.amount}</span>
              
              {isConfirmable ? (
                <button 
                  className="btn-confirm-action"
                  onClick={() => onConfirmPayment && onConfirmPayment( payment.id)}
                >
                  Confirm
                </button>
              ) : (
                <span className={`status-badge ${badgeClass}`}>
                  {badgeText}
                </span>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
};

export default PaymentStatusList;