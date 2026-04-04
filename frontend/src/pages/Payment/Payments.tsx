import React, { useContext, useMemo, useState } from "react";

import { IonContent, IonIcon, IonPage, IonSpinner } from "@ionic/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { arrowForwardOutline, checkmarkCircle, walletOutline } from "ionicons/icons";
import { useParams } from "react-router";

import { HeaderBox } from "components/HeaderBox";
import { ProfilePic } from "components/profilePic";
import { Spinner } from "components/Spinner";
import { AuthContext } from "contexts/AuthProvider";
import { toast } from "Hooks/useToast";
import { formatINR } from "lib/utils";
import { confirmGiverPayment, confirmReceiverPayment, getRoundPayments } from "pages/Payment/servicee";
import type { PaymentDetail, PaymentStatus } from "types";

import { ConfirmPaymentModal } from "./ConfirmPaymentModal";

const STATUS_CONFIG: Record<PaymentStatus, { label: string; dotColor: string; textColor: string }> = {
    COMPLETED: { label: "Completed", dotColor: "bg-emerald-500", textColor: "text-emerald-600" },
    GIVER_CONFIRMED: { label: "Awaiting Confirm", dotColor: "bg-amber-400", textColor: "text-amber-600" },
    PENDING: { label: "Pending", dotColor: "bg-orange-400", textColor: "text-orange-500" },
    DUE: { label: "Due", dotColor: "bg-red-400", textColor: "text-red-500" }
};

const SummaryCard: React.FC<{ payments: PaymentDetail[] }> = ({ payments }) => {
    const total = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const paidCount = payments.filter((p) => p.status === "COMPLETED").length;
    const pendingCount = payments.length - paidCount;
    const progress = payments.length > 0 ? (paidCount / payments.length) * 100 : 0;

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
                <IonIcon icon={walletOutline} className="text-lg" />
                <span className="text-sm">Total Amount</span>
            </div>
            <p className="text-3xl font-bold mb-4">₹ {formatINR(total)}</p>

            <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-sm">{paidCount} Paid</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                    <span className="text-sm">{pendingCount} Pending</span>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-medium">Progress</span>
                    <span className="font-semibold text-xs">
                        {paidCount}/{payments.length}
                    </span>
                </div>
                <div className="w-full h-1.5 bg-primary/20 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

const PaymentCard: React.FC<{
    payment: PaymentDetail;
    userId: string | undefined;
    onGiverConfirm: () => void;
    onReceiverConfirm: (id: number) => void;
    isGiverBusy: boolean;
    isReceiverBusy: boolean;
}> = ({ payment, userId, onGiverConfirm, onReceiverConfirm, isGiverBusy, isReceiverBusy }) => {
    const isGiver = userId === payment.giver.id;
    const isReceiver = userId === payment.receiver.id;
    const isPending = payment.status === "PENDING" || payment.status === "DUE";
    const isGiverConfirmed = payment.status === "GIVER_CONFIRMED";
    const isCompleted = payment.status === "COMPLETED";
    const isInvolved = isGiver || isReceiver;
    const cfg = STATUS_CONFIG[payment.status] ?? STATUS_CONFIG.PENDING;

    const giverLabel = isGiver ? "You" : (payment.giver.username ?? "Unknown");
    const receiverLabel = isReceiver ? "You" : (payment.receiver.username ?? "Unknown");

    const showPayBtn = isGiver && isPending;
    const showConfirmBtn = isReceiver && isGiverConfirmed;

    return (
        <div
            className={`rounded-2xl border bg-white transition-shadow ${
                isInvolved ? "border-primary/20 shadow-md shadow-primary/5" : "border-gray-100 shadow-sm"
            }`}
        >
            <div className="flex items-center gap-3 p-4">
                <div className="relative">
                    <ProfilePic
                        src={payment.giver.profile_pic}
                        alt={giverLabel}
                        className={isGiver ? "ring-2 ring-primary/30 ring-offset-1" : ""}
                    />
                    {/* TODO: Change it to online status dot */}
                    {isCompleted && (
                        <IonIcon
                            icon={checkmarkCircle}
                            className="absolute -bottom-0.5 -right-0.5 text-emerald-500 text-base bg-white rounded-full"
                        />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-sm">
                        <span className={`font-semibold truncate ${isGiver ? "text-primary" : "text-gray-900"}`}>
                            {giverLabel}
                        </span>
                        <IonIcon icon={arrowForwardOutline} className="text-gray-300 text-xs shrink-0" />
                        <span className={`font-semibold truncate ${isReceiver ? "text-primary" : "text-gray-900"}`}>
                            {receiverLabel}
                        </span>
                    </div>
                    <p className="font-nexa text-lg font-bold text-dark mt-0.5 mb-0 leading-tight">
                        ₹{formatINR(payment.amount)}
                    </p>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-1">
                    {showPayBtn ? (
                        <button
                            disabled={isGiverBusy}
                            onClick={onGiverConfirm}
                            className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold
                                       active:scale-95 transition-all disabled:opacity-60"
                        >
                            {isGiverBusy ? <IonSpinner name="crescent" className="w-4 h-4" /> : "Pay"}
                        </button>
                    ) : showConfirmBtn ? (
                        <button
                            disabled={isReceiverBusy}
                            onClick={() => onReceiverConfirm(payment.id)}
                            className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold
                                       active:scale-95 transition-all disabled:opacity-60"
                        >
                            {isReceiverBusy ? <IonSpinner name="crescent" className="w-4 h-4" /> : "Confirm"}
                        </button>
                    ) : (
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${cfg.textColor}`}>
                            <span className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
                            {cfg.label}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

const Payments: React.FC = () => {
    const { roundId } = useParams<{ roundId: string }>();
    const { user } = useContext(AuthContext)!;
    const queryClient = useQueryClient();
    const [pendingPayment, setPendingPayment] = useState<PaymentDetail | null>(null);

    const { data: payments, isLoading } = useQuery({
        queryKey: ["payments-round", roundId],
        queryFn: () => getRoundPayments(Number(roundId))
    });

    const giverConfirmMutation = useMutation({
        mutationFn: confirmGiverPayment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payments-round", roundId] });
            toast({ message: "Payment marked as paid!", color: "success" });
        },
        onError: () => toast({ message: "Failed to confirm payment.", color: "danger" })
    });

    const receiverConfirmMutation = useMutation({
        mutationFn: confirmReceiverPayment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payments-round", roundId] });
            toast({ message: "Payment confirmed!", color: "success" });
        },
        onError: () => toast({ message: "Failed to confirm payment.", color: "danger" })
    });

    const paymentList = payments?.data ?? [];

    const { userPayments, otherPayments } = useMemo(() => {
        const mine: PaymentDetail[] = [];
        const rest: PaymentDetail[] = [];
        for (const p of paymentList) {
            if (p.giver.id === user?.id || p.receiver.id === user?.id) mine.push(p);
            else rest.push(p);
        }
        return { userPayments: mine, otherPayments: rest };
    }, [paymentList, user?.id]);

    const renderCard = (payment: PaymentDetail) => (
        <PaymentCard
            key={payment.id}
            payment={payment}
            userId={user?.id}
            onGiverConfirm={() => setPendingPayment(payment)}
            onReceiverConfirm={(id) => receiverConfirmMutation.mutate(id)}
            isGiverBusy={giverConfirmMutation.isPending && giverConfirmMutation.variables === payment.id}
            isReceiverBusy={receiverConfirmMutation.isPending && receiverConfirmMutation.variables === payment.id}
        />
    );

    const isGiver = paymentList.length > 0 && paymentList.some((p) => p.giver.id === user?.id);
    const isReceiver = paymentList.length > 0 && paymentList.some((p) => p.receiver.id === user?.id);

    return (
        <IonPage className="payments-page">
            <HeaderBox title="Payments" subTitle={`ROUND ${roundId}`} />
            <IonContent scrollY>
                <div className="p-4 space-y-5">
                    {isLoading ? (
                        <Spinner />
                    ) : paymentList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <IonIcon icon={walletOutline} className="text-5xl text-gray-300 mb-3" />
                            <p className="text-gray-400 font-medium">No payments yet</p>
                        </div>
                    ) : (
                        <>
                            {isReceiver && <SummaryCard payments={paymentList} />}

                            {userPayments.length > 0 && (
                                <section>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                                        Your Payments
                                    </p>
                                    <div className="space-y-3">{userPayments.map(renderCard)}</div>
                                </section>
                            )}

                            {otherPayments.length > 0 && isReceiver && (
                                <section>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                                        All Payments
                                    </p>
                                    <div className="space-y-3">{otherPayments.map(renderCard)}</div>
                                </section>
                            )}
                        </>
                    )}
                </div>
            </IonContent>

            <ConfirmPaymentModal
                payment={pendingPayment}
                isLoading={giverConfirmMutation.isPending}
                onConfirm={(id) => {
                    giverConfirmMutation.mutate(id);
                    setPendingPayment(null);
                }}
                onDismiss={() => setPendingPayment(null)}
            />
        </IonPage>
    );
};

export default Payments;
