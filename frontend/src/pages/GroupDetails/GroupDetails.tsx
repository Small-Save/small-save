import React, { useCallback, useEffect, useRef } from "react";

import { IonButton, IonContent, IonIcon, IonPage } from "@ionic/react";
import { useQuery } from "@tanstack/react-query";
import { alertCircleOutline, calendarOutline, diamondOutline } from "ionicons/icons";
import { useHistory, useParams } from "react-router";
import { fetchCurrentPaymentStatus } from "services/payments";
import useGroupStore from "stores/useGroup";

import { HeaderBox } from "components/HeaderBox";
import { AuthContext } from "contexts/AuthProvider";
import { BiddingRound, fetchBiddingDetails } from "pages/Bidding/services";
import { fetchGroup } from "pages/CreateGroup/services";
import { Group } from "types";

import useRoundStore from "./useRound";

interface BiddingInfoCardProps {
    currentRound: number;
    totalRounds: number;
    totalAmount: number;
    monthlyPool: number;
    duration: number;
    paidCount: number;
    totalMembers: number;
}

const BiddingInfoCard: React.FC<BiddingInfoCardProps> = ({
    currentRound,
    totalRounds,
    totalAmount,
    monthlyPool,
    duration,
    paidCount,
    totalMembers
}) => {
    const progressPercentage = totalMembers > 0 ? (paidCount / totalMembers) * 100 : 0;

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <span className="bg-blue-50 text-primary text-xs font-semibold px-3 py-1.5 rounded-md tracking-wide">
                    ROUND {String(currentRound).padStart(2, "0")} OF {totalRounds}
                </span>
                <span className="w-3 h-3 bg-green-400 rounded-full" />
            </div>

            <p className="font-nexa text-4xl font-bold text-dark leading-tight mb-4">
                ₹ {totalAmount.toLocaleString("en-IN")}
            </p>

            <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Monthly Pool</span>
                    <span className="font-nexa font-semibold text-sm text-dark">
                        ₹ {monthlyPool.toLocaleString("en-IN")}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Duration</span>
                    <span className="font-nexa font-semibold text-sm text-dark">{duration} Months</span>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm">Payment Progress</span>
                    <span className="font-nexa font-semibold text-sm text-dark">
                        {String(paidCount).padStart(2, "0")}/{totalMembers}
                    </span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-dark rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

const RoundSelector: React.FC<{ size: number; roundId: number; setRoundId: (roundId: number) => void }> = ({
    size,
    roundId,
    setRoundId
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Optional: Auto-scroll to selected round if it's off-screen
    useEffect(() => {
        const activeBtn = scrollRef.current?.querySelector(`[data-active="true"]`);
        activeBtn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }, [roundId]);

    return (
        <div
            ref={scrollRef}
            className="overflow-x-auto pb-4 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
            <p className="font-nexa text-sm font-semibold mb-2 text-dark">Select Round</p>

            <div className="flex gap-2 overflow-x-auto pb-2">
                {Array.from({ length: size }, (_, index) => index + 1).map((round) => {
                    const isSelected = round === roundId;

                    return (
                        <button
                            key={round}
                            data-active={isSelected}
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-all ${
                                isSelected
                                    ? "bg-primary text-primary-contrast shadow-sm"
                                    : "bg-white border border-primary text-primary"
                            } active:scale-95`}
                            style={{ borderRadius: "50%" }}
                            onClick={() => {
                                setRoundId(Number(round));
                            }}
                        >
                            {round}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const GroupDetail: React.FC = () => {
    const { roundId, setRoundId } = useRoundStore();
    const history = useHistory();
    const { groupId } = useParams<{ groupId: string }>();
    const { group, setGroup } = useGroupStore();

    const { data: groupData } = useQuery({
        queryKey: ["group", groupId],
        queryFn: () => fetchGroup(groupId),
        enabled: !group && !!groupId,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10
    });
    useEffect(() => {
        if (groupData) {
            setGroup(groupData.data as Group);
        }
    }, [groupData]);

    const { data: biddingRound } = useQuery({
        queryKey: ["biddingRound", roundId],
        queryFn: () => fetchBiddingDetails(roundId ?? 0),
        enabled: !!roundId,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10
    });

    const round = biddingRound?.data?.bidding_round;

    useEffect(() => {
        if (group?.latest_bidding_round_id) {
            setRoundId(Number(group?.latest_bidding_round_id));
        }
    }, [group?.latest_bidding_round_id, setRoundId]);

    const { data: paymentStatus } = useQuery({
        queryKey: ["paymentStatus", roundId],
        queryFn: () => fetchCurrentPaymentStatus(roundId ?? 0),
        enabled: !!roundId,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10
    });

    const { size = 0, members = [], start_date = null, latest_bidding_round_id = 0 } = group ?? {};

    const paidCount = paymentStatus?.data?.payments?.filter((p) => p.status === "COMPLETED").length || 0;

    const handleOnclick = useCallback(() => {
        try {
            history.push(`/group/${group?.id}/bidding`, "forward");
        } catch (error) {
            console.error("Navigation error:", error);
        }
    }, [group, history]);

    return (
        <IonPage>
            <HeaderBox
                title={group?.name || "Group Details"}
                subTitle={`ROUND ${latest_bidding_round_id} OF ${size}`}
            />

            <IonContent className="">
                <div className="p-4 space-y-4">
                    <div>
                        <BiddingInfoCard
                            currentRound={Number(round?.round_number)}
                            totalRounds={size}
                            totalAmount={Number(group?.target_amount)}
                            monthlyPool={Math.round(Number(group?.target_amount) / size)}
                            duration={group?.duration || 0}
                            paidCount={paidCount}
                            totalMembers={size}
                        />
                    </div>

                    <RoundSelector size={size} roundId={roundId} setRoundId={setRoundId} />

                    <div className="flex justify-between">
                        {
                            <IonButton
                                onClick={() => {
                                    history.push(`/payments/${groupId}/`);
                                }}
                            >
                                Payments
                            </IonButton>
                        }
                        <IonButton className="pool-button" onClick={handleOnclick}>
                            <IonIcon icon={diamondOutline}></IonIcon>
                            <p>Pool system</p>
                        </IonButton>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-gray-100">
                        <p className="font-bold text-md mb-4">Upcoming Events</p>
                        <div className="space-y-3">
                            <div className="bg-primary/5 rounded-xl py-3 px-4 flex items-center">
                                <IonIcon icon={alertCircleOutline} className="text-[26px] text-gray-800 shrink-0" />
                                <div className="flex-1 text-center">
                                    <p className="font-semibold text-sm">Payment Due</p>
                                    <p className="text-sm text-primary/70 mt-0.5">Pending Dues clear it</p>
                                </div>
                                <div className="w-[26px] shrink-0"></div>
                            </div>
                            <div className="bg-primary/5 rounded-xl p-4 flex items-center">
                                <IonIcon icon={calendarOutline} className="text-[26px] text-gray-800 shrink-0" />
                                <div className="flex-1 text-center">
                                    <p className="font-semibold text-sm">Round 2 to get started</p>
                                    <p className="text-sm text-primary/70 mt-0.5">Scheduled at Tuesday, 7:00 PM</p>
                                </div>
                                <div className="w-[26px] shrink-0"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default GroupDetail;
