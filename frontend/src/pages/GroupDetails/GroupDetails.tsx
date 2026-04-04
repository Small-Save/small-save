import React, { useCallback, useEffect, useMemo, useRef } from "react";

import { IonButton, IonContent, IonIcon, IonPage } from "@ionic/react";
import { useQuery } from "@tanstack/react-query";
import { alertCircleOutline, calendarOutline } from "ionicons/icons";
import { useHistory, useParams } from "react-router";
import useGroupStore from "stores/useGroup";

import { HeaderBox } from "components/HeaderBox";
import { BiddingRound } from "pages/Bidding/services";
import { fetchGroup } from "pages/CreateGroup/services";
import { getRoundPayments } from "pages/Payment/servicee";

import useRoundStore from "./useRound";

import { BiddingInfoCard } from "./BiddingInfoCard";


const RoundSelector: React.FC<{
    roundId: number | null;
    setRoundId: (roundId: number) => void;
    biddingRounds: BiddingRound[];
}> = ({ roundId, setRoundId, biddingRounds }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const activeBtn = scrollRef.current?.querySelector(`[data-active="true"]`);
        activeBtn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }, [roundId]);

    const { upcomingRounds, completedRounds } = useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const upcomingRounds = new Set<number>();
        const completedRounds = new Set<number>();
        for (const r of biddingRounds) {
            if (r.status === "completed") completedRounds.add(r.round_number);
            if (r.status === "scheduled") {
                const scheduled = new Date(r.scheduled_time);
                const isCurrentMonth = scheduled.getFullYear() === currentYear && scheduled.getMonth() === currentMonth;
                if (!isCurrentMonth) upcomingRounds.add(r.round_number);
            }
        }
        return { upcomingRounds, completedRounds };
    }, [biddingRounds]);

    return (
        <div
            ref={scrollRef}
            className="overflow-x-auto pb-4 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
            <p className="font-nexa text-sm font-semibold mb-3">Select Round</p>

            <div className="flex justify-center gap-2 overflow-x-auto pb-2">
                {biddingRounds.map((round) => {
                    const isSelected = round.id === roundId;
                    return (
                        <button
                            key={round.id}
                            data-active={isSelected}
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-all ${
                                isSelected
                                    ? "bg-primary text-primary-contrast shadow-sm"
                                    : "bg-white border border-primary text-primary"
                            } active:scale-95`}
                            style={{ borderRadius: "50%" }}
                            onClick={() => setRoundId(round.id)}
                            disabled={upcomingRounds.has(round.round_number)}
                        >
                            {round.round_number}
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
        if (groupData?.data) {
            setGroup(groupData.data);
            if (groupData.data.current_bidding_round) {
                setRoundId(groupData.data.current_bidding_round.id);
            }
        }
    }, [groupData]);

    useEffect(() => {
        if (group?.current_bidding_round) {
            setRoundId(group.current_bidding_round.id);
        }
    }, [group?.current_bidding_round, setRoundId]);

    const { data: paymentStatus } = useQuery({
        queryKey: ["payments-round", roundId],
        queryFn: () => getRoundPayments(roundId),
        enabled: !!roundId,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10
    });

    const { size = 0, current_bidding_round } = group ?? {};

    const paidCount = paymentStatus?.data?.filter((p) => p.status === "COMPLETED").length ?? 0;

    const handleOnclick = useCallback(() => {
        try {
            history.push(`/group/${group?.id}/bidding`, "forward");
        } catch (error) {
            console.error("Navigation error:", error);
        }
    }, [group, history]);

    return (
        <IonPage>
            <HeaderBox title={group?.name || "Group Details"} subTitle={`${size} Members Active`} />

            <IonContent>
                <div className="p-4 space-y-4">
                    <div>
                        <BiddingInfoCard
                            currentRound={current_bidding_round as BiddingRound}
                            totalRounds={group?.bidding_rounds?.length ?? 0}
                            totalAmount={Number(group?.target_amount)}
                            monthlyPool={Math.round(Number(group?.target_amount) / size)}
                            duration={group?.duration || 0}
                            paidCount={paidCount}
                            totalPayments={paymentStatus?.data?.length ?? 0}
                        />
                    </div>

                    <RoundSelector
                        roundId={roundId}
                        setRoundId={setRoundId}
                        biddingRounds={group?.bidding_rounds ?? []}
                    />

                    <div className="flex justify-between">
                        {
                            <IonButton
                                onClick={() => {
                                    history.push(`/payments/${roundId}/`);
                                }}
                            >
                                Payments
                            </IonButton>
                        }
                        <IonButton className="pool-button" onClick={handleOnclick}>
                            Pool system
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
