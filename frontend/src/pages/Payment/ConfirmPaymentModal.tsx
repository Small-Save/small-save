import React from "react";

import { IonButton, IonIcon, IonModal, IonSpinner } from "@ionic/react";
import { checkmarkOutline } from "ionicons/icons";

import { ProfilePic } from "components/profilePic";
import { formatINR } from "lib/utils";
import type { PaymentDetail } from "types";

interface ConfirmPaymentModalProps {
    payment: PaymentDetail | null;
    isLoading: boolean;
    onConfirm: (paymentId: number) => void;
    onDismiss: () => void;
}
export const ConfirmPaymentModal: React.FC<ConfirmPaymentModalProps> = ({
    payment,
    isLoading,
    onConfirm,
    onDismiss
}) => (
    <IonModal
        isOpen={payment !== null}
        onDidDismiss={onDismiss}
        initialBreakpoint={0.48}
        breakpoints={[0, 0.48]}
        className="pay-confirm-modal"
    >
        {payment && (
            <div className="px-6 pt-6 pb-8 flex flex-col gap-5">
                <p className="text-primary/50 text-sm leading-relaxed mb-5">
                    Please Confirm that you paid the receiver after payment is done by your preferred payment methods
                </p>
                <div className="space-y-3 mb-6 px-1">
                    <div className="flex justify-between items-center">
                        <span className="text-primary text-sm">Recipient</span>
                        <div className="flex items-center gap-2">
                            <ProfilePic src={payment.receiver.profile_pic} alt={payment.receiver.username} size={24} />
                            <span className="text-gray-900 text-sm font-semibold">
                                {payment.receiver.username ?? "Receiver"}
                            </span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-primary text-sm font-medium">Total Amount</span>
                        <span className="font-nexa text-lg font-bold text-dark">₹ {formatINR(payment.amount)}</span>
                    </div>
                </div>
                <IonButton disabled={isLoading} onClick={() => onConfirm(payment.id)} expand="block">
                    {isLoading ? (
                        <IonSpinner name="crescent" className="w-5 h-5" />
                    ) : (
                        <div className="flex items-center gap-2">
                            <IonIcon icon={checkmarkOutline} className="text-xl" />
                            Confirm Payment
                        </div>
                    )}
                </IonButton>
            </div>
        )}
    </IonModal>
);
