import { IonButton, IonContent, IonIcon, IonInput, IonPage, IonSpinner } from "@ionic/react";
import { HeaderBox } from "components/HeaderBox";
import { settingsOutline, chevronForwardOutline, trendingDownOutline } from "ionicons/icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import profileImageTemp from "assets/images/profileImageTemp.jpg";
import useFormInput from "Hooks/useFormInput";
import { Bid, BiddingRound, fetchBiddingDetails, fetchBiddingStatus, placeBid } from "./services";
import { useParams } from "react-router";
import { useGroup } from "Hooks/useGroup";
import { useBiddingSocket } from "./useBiddingSocket";
import { getTimeAgo } from "lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface BiddingParams {
    groupId: string;
}

const Bidding: React.FC = () => {
    const [timeRemainingLabel, setTimeRemainingLabel] = useState("");
    const bidAmountInput = useFormInput("");
    const [bidSubmitError, setBidSubmitError] = useState<string | null>(null);
    const [isSubmittingBid, setIsSubmittingBid] = useState(false);
    const { groupId } = useParams<BiddingParams>();
    const queryClient = useQueryClient();

    const groupQuery = useGroup(groupId);
    const group = groupQuery.data?.data;
    const roundId = group?.latest_bidding_round_id ?? "";

    const biddingSocketRef = useBiddingSocket<Bid>(roundId, (newBid) => {
        if (!roundId) return;
        queryClient.setQueryData(["bidding-round", roundId], (oldData: any) => {
            if (!oldData) return oldData;
            return {
                ...oldData,
                bids: [newBid, ...oldData.bids]
            };
        });
    });

    const biddingDetailsQuery = useQuery({
        queryKey: ["bidding-round", roundId],
        enabled: !!roundId,
        queryFn: async () => {
            const [detailsResponse, statusResponse] = await Promise.all([
                fetchBiddingDetails(roundId!),
                fetchBiddingStatus(roundId!)
            ]);

            return {
                round: detailsResponse.data?.bidding_round,
                bids: statusResponse.data?.bids ?? []
            };
        }
    });

    const bids: Bid[] = biddingDetailsQuery.data?.bids ?? [];
    const round: BiddingRound | undefined = biddingDetailsQuery.data?.round;

    const isBiddingActive = round?.status === "active";

    useEffect(() => {
        if (!round?.end_time || !round?.start_time) return;

        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const endTime = new Date(round.end_time).getTime();
            const startTime = new Date(round.start_time).getTime();

            // Validate dates
            if (isNaN(endTime) || isNaN(startTime)) {
                console.error("Invalid date format:", {
                    end_time: round.end_time,
                    start_time: round.start_time
                });
                return;
            }
            const difference = endTime - now;

            if (difference > 0) {
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);

                setTimeRemainingLabel(`${hours}h ${minutes}m ${seconds}s`);
            } else {
                setTimeRemainingLabel("0h 0m 0s");
            }
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(interval);
    }, [round?.end_time, round?.start_time]);

    const handlePlaceBid = useCallback(async () => {
        setBidSubmitError(null);

        if (!roundId) {
            setBidSubmitError("No active bidding round found for this group.");
            return;
        }

        const parsedAmount = Number.parseInt(bidAmountInput.value);
        if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
            setBidSubmitError("Enter a valid bid amount.");
            return;
        }

        if (group?.target_amount && parsedAmount >= group.target_amount) {
            setBidSubmitError(`Bid must be less than the target amount of ₹${group.target_amount}.`);
            return;
        }

        try {
            setIsSubmittingBid(true);
            const response = await placeBid(roundId, parsedAmount);
            const newBid = response.data;
            if (!newBid) {
                setBidSubmitError("Bid could not be placed. Please try again.");
                return;
            }

            queryClient.setQueryData(["bidding-round", roundId], (oldData: any) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    bids: [newBid, ...oldData.bids]
                };
            });

            if (biddingSocketRef.current?.readyState === WebSocket.OPEN) {
                biddingSocketRef.current.send(
                    JSON.stringify({
                        type: "new_bid",
                        bid: newBid
                    })
                );
            }
        } catch (error) {
            console.error("Error placing bid:", error);
            setBidSubmitError("Failed to place bid. Please try again.");
        } finally {
            setIsSubmittingBid(false);
            bidAmountInput.setValue("");
        }
    }, [bidAmountInput.value, roundId, biddingSocketRef]);

    const lowestBid = useMemo(() => {
        if (bids.length === 0) return null;
        return bids.reduce<Bid | null>((lowest, candidate) => {
            if (!lowest) return candidate;
            return candidate.amount < lowest.amount ? candidate : lowest;
        }, null);
    }, [bids]);

    const formattedSchedule = useMemo(() => {
        if (!round?.scheduled_time) return "";
        const date = new Date(round.scheduled_time);
        return isNaN(date.getTime()) ? round.scheduled_time : date.toLocaleString();
    }, [round?.scheduled_time]);

    if (biddingDetailsQuery.error) {
        return (
            <IonPage>
                <HeaderBox title={group?.name ?? "Bidding"} />
                <IonContent className="ion-padding">
                    <p className="text-sm text-red-600">Failed to load bidding data. Please try again.</p>
                    <div className="mt-3">
                        <IonButton onClick={() => biddingDetailsQuery.refetch()} disabled={!roundId || biddingDetailsQuery.isLoading}>
                            Retry
                        </IonButton>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    if (groupQuery.isLoading || (biddingDetailsQuery.isLoading && !round)) {
        return (
            <IonPage>
                <HeaderBox title={group?.name ?? "Bidding"} />
                <IonContent className="ion-padding">
                    <div className="flex items-center justify-center h-full">
                        <IonSpinner />
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    if (!isBiddingActive) {
        // TODO: here check if the bidding is completed then we have to show the winner and top bids etc.
        return (
            <IonPage>
                <HeaderBox title="Bidding Status" />
                <IonContent className="ion-padding">
                    {round?.status === "scheduled" ? (
                        <p>This Bidding round is scheduled at {formattedSchedule}</p>
                    ) : (
                        <p>This Bidding round is currently not active</p>
                    )}
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <HeaderBox
                title={group?.name ?? "Bidding"}
                subTitle={`Round ${round?.round_number} out of ${group?.duration}`}
                actions={[
                    {
                        key: "settings",
                        element: (
                            <IonButton>
                                <IonIcon icon={settingsOutline} />
                            </IonButton>
                        ),
                        slot: "end"
                    }
                ]}
            />
            <IonContent className="ion-padding bg-slate-50">
                <div className="max-w-3xl mx-auto space-y-4 pb-16">
                    {/* winner card */}
                    <div
                        className="rounded-3xl p-6 text-white shadow-xl
                        bg-linear-to-br from-purple-600 to-indigo-600"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs tracking-widest opacity-80">TOTAL POOL</p>
                                <p className="text-4xl font-bold mt-2">₹{group?.target_amount ?? 0}</p>
                            </div>

                            <div className="bg-white/20 px-4 py-2 rounded-xl text-right">
                                <p className="text-xs opacity-80">ENDS IN</p>
                                <p className="font-semibold text-sm">{timeRemainingLabel}</p>
                            </div>
                        </div>

                        {round?.winner_username && (
                            <div className="mt-6 bg-white/10 p-3 rounded-xl flex items-center gap-3">
                                <img src={profileImageTemp} className="w-10 h-10 rounded-full object-cover" />
                                <div>
                                    <p className="text-xs opacity-80">LAST WINNER</p>
                                    <p className="font-semibold">{round.winner_username}</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col space-y-5 bg-white rounded-3xl p-3 shadow-xl">
                        {/* Current Lowest Bidder */}
                        {bids.length > 0 && (
                            <div className="mt-8 text-center">
                                <p className="flex items-center gap-2 justify-center text-xs tracking-widest text-gray-400">
                                    <IonIcon icon={trendingDownOutline} className="text-sm text-green-600" />
                                    CURRENT LOWEST
                                </p>

                                <p className="text-5xl font-bold text-gray-900 mt-2">
                                    ₹{lowestBid ? lowestBid.amount : "—"}
                                </p>

                                {lowestBid?.member?.username && (
                                    <p className="text-green-600 mt-2 text-sm font-medium">
                                        {/* TODO: add a smallll profile image here */}
                                        {lowestBid.member.username} is leading
                                    </p>
                                )}
                            </div>
                        )}
                        {/* Place your Bid */}
                        <div className="flex gap-4 bg-gray-50 rounded-2xl p-4 items-end shadow-sm">
                            {/* <Field label="Place Your Bid" placeholder="Enter the bid amount here" hook={bidAmount} /> */}
                            <IonInput
                                type={"text"}
                                label={"Place your bid"}
                                labelPlacement="stacked"
                                placeholder={"Enter the bid amount here"}
                                inputMode="decimal"
                                className={`${bidAmountInput.isError && "ion-invalid"} ${bidAmountInput.touched && "ion-touched"}`}
                                aria-invalid={bidAmountInput.isError}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handlePlaceBid();
                                    }
                                }}
                                {...bidAmountInput.bind}
                            />
                            <IonButton onClick={handlePlaceBid} disabled={isSubmittingBid}>
                                <IonIcon icon={chevronForwardOutline} />
                            </IonButton>
                        </div>
                        {bidSubmitError && <p className="text-xs text-red-600">{bidSubmitError}</p>}

                        {/* Leader board */}
                        <div className="mt-8 space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-sm font-semibold text-gray-700 tracking-wide">LIVE FEED</p>
                                <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full font-medium">
                                    {bids.length} {bids.length === 1 ? "BID" : "BIDS"}
                                </span>
                            </div>
                            <div className="space-y-3 max-h-112 overflow-y-auto pr-2">
                                {!biddingDetailsQuery.isLoading && bids.length === 0 && (
                                    <p className="text-sm text-gray-500 text-center py-8">
                                        No bids yet. Be the first to place a bid.
                                    </p>
                                )}
                                {bids.map((bid, idx) => {
                                    return (
                                        <div
                                            key={bid.id}
                                            className={`flex justify-between items-center p-4 rounded-3xl shadow-sm transition-all ${
                                                idx === 0
                                                    ? "bg-linear-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-200"
                                                    : idx === 1
                                                      ? "bg-linear-to-r from-slate-50 to-slate-100 border-2 border-slate-200"
                                                      : "bg-white hover:shadow-md border border-gray-200"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={profileImageTemp}
                                                    className="w-12 h-12 rounded-2xl object-cover shadow-sm"
                                                />
                                                {/* TODO: add user postion in the bid as badge */}
                                                <div>
                                                    <p className="font-semibold text-gray-800 text-sm">
                                                        {bid.member?.username}
                                                    </p>
                                                    <p className="text-xs font-medium text-gray-500">
                                                        {idx === 0
                                                            ? "🥇 LEADING"
                                                            : idx === 1
                                                              ? "🥈 CHALLENGING"
                                                              : `#${idx + 1}`}
                                                    </p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-lg font-bold text-gray-900">₹{bid.amount}</p>
                                                <p className="text-xs text-gray-500 text-end">
                                                    {getTimeAgo(bid.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Bidding;
