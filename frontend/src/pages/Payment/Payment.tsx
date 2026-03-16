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
  IonSpinner
} from "@ionic/react";
import {
  arrowBackOutline,
  informationCircle,
  personCircle,
  checkmarkCircle,
  lockClosed,
} from "ionicons/icons";
import { useHistory, useParams } from "react-router";
import { getPaymentDetails, confirmGiverPayment } from "services/payments";
import type { PaymentDetail } from "types";
import "./Payment.css";

const Payment: React.FC = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const history = useHistory();

  const [paymentData, setPaymentData] = useState<PaymentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        const response = await getPaymentDetails(paymentId);
        if (response.data) {
          setPaymentData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch payment details", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (paymentId) {
      fetchDetails();
    }
  }, [paymentId]);

  const handleCancel = () => {
    if (paymentData) {
      const encodedGroupName = encodeURIComponent(paymentData.group_name);
      history.replace(`/groupdetail/${paymentData.group_id}/${encodedGroupName}`);
    } else {
      history.goBack();
    }
  };

  const handleConfirm = async () => {
    if (!paymentData) return;

    try {
      setIsConfirming(true);
      // Call the giver confirm API
      await confirmGiverPayment(paymentId);
      
      // Navigate back to the group details page after success
      const encodedGroupName = encodeURIComponent(paymentData.group_name);
      history.replace(`/groupdetail/${paymentData.group_id}/${encodedGroupName}`);
    } catch (error) {
      console.error("Failed to confirm payment", error);
      // TODO: Add an Ionic Toast here to notify the user that the payment confirmation failed
    } finally {
      setIsConfirming(false);
    }
  };

  // Show a loading state while fetching the API
  if (isLoading || !paymentData) {
    return (
      <IonPage>
        <IonContent className="ion-padding ion-text-center">
          <div style={{ marginTop: '50vh', transform: 'translateY(-50%)' }}>
            <IonSpinner name="crescent" color="primary" />
            <p style={{ color: '#64748b', marginTop: '16px' }}>Loading secure transaction...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="payment-header">
          <IonButtons slot="start">
            <IonButton onClick={handleCancel}>
              <IonIcon icon={arrowBackOutline} className="back-icon" />
            </IonButton>
          </IonButtons>
          <IonTitle className="payment-title">Payment Confirmation</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="payment-content" scrollY={true}>
        <div className="top-dark-bg"></div>

        <div className="payment-body">
          <div className="shield-wrapper">
            <div className="shield-bg">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" fill="white" />
                <path d="M12 15.5L10.5 14C8 11.8 6.5 10.4 6.5 8.7C6.5 7.1 7.8 5.8 9.5 5.8C10.5 5.8 11.4 6.3 12 7C12.6 6.3 13.5 5.8 14.5 5.8C16.2 5.8 17.5 7.1 17.5 8.7C17.5 10.4 16 11.8 13.5 14L12 15.5Z" fill="#1c5cf1" />
              </svg>
            </div>
          </div>
          <div className="custom-card">
            <div className="info-box">
              <div className="info-icon-wrapper">
                <IonIcon icon={informationCircle} className="info-icon" />
              </div>
              <p className="info-text">
                Please confirm that you paid the receiver after payment is done
                by your preferred payment method.
              </p>
            </div>

            <div className="divider-subtle"></div>

            <div className="details-row">
              <span className="details-label">Recipient</span>
              <div className="details-value recipient-value">
                <IonIcon icon={personCircle} className="avatar-icon" />
                <span>{paymentData.receiver_name}</span>
              </div>
            </div>

            <div className="divider-subtle"></div>

            <div className="details-row amount-row-container">
              <span className="details-label">Total Amount</span>
              <span className="amount-value">
                ₹{paymentData.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="actions-container">
            <button 
              className="btn-confirm" 
              onClick={handleConfirm}
              disabled={isConfirming}
              style={{ opacity: isConfirming ? 0.7 : 1 }}
            >
              {isConfirming ? <IonSpinner name="dots" /> : <><IonIcon icon={checkmarkCircle} /> Confirm Payment</>}
            </button>

            <button className="btn-cancel" onClick={handleCancel} disabled={isConfirming}>
              Cancel Transaction
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Payment;