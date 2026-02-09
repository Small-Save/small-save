import { IonButton, IonContent, IonIcon, IonInput, IonPage, IonProgressBar } from "@ionic/react";
import { HeaderBox } from "components/HeaderBox";
import { settingsOutline, timerOutline, chevronForwardOutline } from "ionicons/icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import profileImageTemp from "assets/images/profileImageTemp.jpg";
import useFormInput from "Hooks/useFormInput";
import { Bid, BiddingRound, fetchBiddingDetails, fetchBiddingStatus, placeBid } from "./services";
import { useParams } from "react-router";
import { useGroup } from "Hooks/useGroup";
import { useBiddingSocket } from "./useBiddingSocket";

interface BiddingParams {
    groupId: string;
}

const Bidding: React.FC = () => {
    const [timeProgress, setTimeProgress] = useState(0);
    const [timeRemainingLabel, setTimeRemainingLabel] = useState("");

    const [bids, setBids] = useState<Bid[]>([]);
    const bidAmountInput = useFormInput("");
    const [round, setRound] = useState<BiddingRound>();
    const [isRoundLoading, setIsRoundLoading] = useState(false);
    const [roundLoadError, setRoundLoadError] = useState<string | null>(null);
    const [bidSubmitError, setBidSubmitError] = useState<string | null>(null);
    const [isSubmittingBid, setIsSubmittingBid] = useState(false);
    const { groupId } = useParams<BiddingParams>();
    const groupQuery = useGroup(groupId);
    const group = groupQuery.data?.data;

    const roundId = group?.latest_bidding_round_id ?? "";

    const biddingSocketRef = useBiddingSocket<Bid>(roundId, (newBid) => {
        setBids((prevBids) => [newBid, ...prevBids]);
    });

    const isBiddingActive = round?.status === "active";

    const lowestBid = useMemo(() => {
        if (bids.length === 0) return null;
        return bids.reduce<Bid | null>((lowest, candidate) => {
            if (!lowest) return candidate;
            const lowestAmount = Number.parseFloat(lowest.amount);
            const candidateAmount = Number.parseFloat(candidate.amount);
            if (Number.isNaN(lowestAmount)) return candidate;
            if (Number.isNaN(candidateAmount)) return lowest;
            return candidateAmount < lowestAmount ? candidate : lowest;
        }, null);
    }, [bids]);

    const formattedSchedule = useMemo(() => {
        if (!round?.scheduled_time) return "";
        const date = new Date(round.scheduled_time);
        return isNaN(date.getTime()) ? round.scheduled_time : date.toLocaleString();
    }, [round?.scheduled_time]);

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

            const totalTime = endTime - startTime;
            const difference = endTime - now;

            if (difference > 0) {
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);

                setTimeRemainingLabel(`${hours}h ${minutes}m ${seconds}s`);
                const rawProgress = totalTime > 0 ? 1 - difference / totalTime : 0;
                setTimeProgress(Math.min(1, Math.max(0, rawProgress)));
            } else {
                setTimeRemainingLabel("0h 0m 0s");
                setTimeProgress(1);
            }
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(interval);
    }, [round?.end_time, round?.start_time]);

    useEffect(() => {
        const fetchData = async () => {
            if (!roundId) return;
            setIsRoundLoading(true);
            setRoundLoadError(null);
            try {
                const detailsResponse = await fetchBiddingDetails(roundId);
                const statusResponse = await fetchBiddingStatus(roundId);
                setBids(statusResponse.data?.bids ?? []);
                setRound(detailsResponse.data?.bidding_round);
            } catch (error) {
                console.error("Error fetching bidding details or connecting to WebSocket:", error);
                setRoundLoadError("Failed to load bidding data. Please try again.");
            } finally {
                setIsRoundLoading(false);
            }
        };

        fetchData();
        return () => {};
    }, [roundId]);

    const handlePlaceBid = useCallback(async () => {
        setBidSubmitError(null);

        if (!roundId) {
            setBidSubmitError("No active bidding round found for this group.");
            return;
        }

        const parsedAmount = Number.parseFloat(bidAmountInput.value);
        if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
            setBidSubmitError("Enter a valid bid amount.");
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

            setBids((prevBids) => [newBid, ...prevBids]);
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
        }
    }, [bidAmountInput.value, roundId, biddingSocketRef]);

    if (groupQuery.isLoading) {
        return (
            <IonPage>
                <IonContent className="ion-padding">
                    <div className="flex items-center justify-center h-full">
                        <p>Loading.....</p>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    if (roundLoadError) {
        return (
            <IonPage>
                <HeaderBox title={group?.name ?? "Bidding"} />
                <IonContent className="ion-padding">
                    <p className="text-sm text-red-600">{roundLoadError}</p>
                    <div className="mt-3">
                        <IonButton
                            onClick={() => {
                                // Trigger a refetch by relying on the same roundId effect.
                                // This keeps the logic in one place.
                                setRoundLoadError(null);
                                setIsRoundLoading(true);
                                fetchBiddingDetails(roundId)
                                    .then((detailsResponse) => {
                                        setRound(detailsResponse.data?.bidding_round);
                                        return fetchBiddingStatus(roundId);
                                    })
                                    .then((statusResponse) => {
                                        setBids(statusResponse.data?.bids ?? []);
                                    })
                                    .catch((error) => {
                                        console.error("Error fetching bidding data:", error);
                                        setRoundLoadError("Failed to load bidding data. Please try again.");
                                    })
                                    .finally(() => {
                                        setIsRoundLoading(false);
                                    });
                            }}
                            disabled={!roundId || isRoundLoading}
                        >
                            Retry
                        </IonButton>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    if (isRoundLoading && !round) {
        return (
            <IonPage>
                <HeaderBox title={group?.name ?? "Bidding"} />
                <IonContent className="ion-padding">
                    <IonProgressBar type="indeterminate" />
                    <p className="mt-3 text-sm">Loading bidding round…</p>
                </IonContent>
            </IonPage>
        );
    }

    if (!isBiddingActive) {
        // TODO: here check if the bidding is completed then we have to the winner and top bids etc.
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
            <IonContent className="ion-padding">
                {isRoundLoading && <IonProgressBar type="indeterminate" />}
                {/* winner card */}
                <div className="bg-indigo-500 pt-2 pb-2 text-white mb-3 rounded-lg">
                    <span className="flex flex-col items-center-safe">
                        <p className="font-bold5">Current Round</p>
                        <p className="text-xs">{group?.target_amount} pool</p>
                    </span>

                    {/* Winner Banner */}
                    <div className="flex flex-col items-center-safe">
                        <p className="font-bold">This round's Winner</p>
                        <p className="text-xs">{round?.winner_username}</p>
                    </div>
                </div>
                <div className="flex flex-col space-y-3.5 shadow-lg">
                    <p>Bidding System</p>
                    <div className="flex flex-col gap-1 rounded-lg border-2 border-solid border-orange-800 bg-amber-300 p-1">
                        <p className="text-xs text-center">Time Until Winner Selection</p>
                        <p className="flex items-center gap-1 justify-end-safe text-xs">
                            <IonIcon icon={timerOutline} /> {timeRemainingLabel}
                        </p>
                        <IonProgressBar value={timeProgress}></IonProgressBar>
                        <p className="text-xs text-center">Place your bid before time runs out!</p>
                    </div>

                    {/* Current Lowest Bidder */}
                    <div className="flex flex-col space-y-1 items-center p-1 rounded-lg border-2 border-solid border-green-600 bg-green-200 ">
                        <p>Current Lowest Bid</p>
                        <p>{lowestBid ? `₹${lowestBid.amount}` : "—"}</p>
                        <div className="flex items-center gap-1">
                            <img src={profileImageTemp} width={30} height={30} className="rounded-xl" />
                            <span>{lowestBid?.member?.username ? `${lowestBid.member.username} is leading!` : ""}</span>
                        </div>
                    </div>
                    {/* Place your Bid */}
                    <div className="flex p-1 ">
                        {/* <Field label="Place Your Bid" placeholder="Enter the bid amount here" hook={bidAmount} /> */}
                        <IonInput
                            type={"text"}
                            label={"Place Your Bid"}
                            labelPlacement="stacked"
                            placeholder={"Enter the bid amount here"}
                            inputMode="decimal"
                            className={`${bidAmountInput.isError && "ion-invalid"} ${bidAmountInput.touched && "ion-touched"}`}
                            aria-invalid={bidAmountInput.isError}
                            {...bidAmountInput.bind}
                        />
                        <IonButton onClick={handlePlaceBid} disabled={isSubmittingBid}>
                            <IonIcon icon={chevronForwardOutline} />
                        </IonButton>
                    </div>
                    {bidSubmitError && <p className="text-xs text-red-600">{bidSubmitError}</p>}

                    {/* Leader board */}
                    <div className="space-y-2">
                        <p className="text-sm ">Live Bidding Leaderboard</p>
                        <div className="space-y-3">
                            {!isRoundLoading && bids.length === 0 && (
                                <p className="text-sm text-gray-600">No bids yet. Be the first to place a bid.</p>
                            )}
                            {bids.map((bid, idx) => {
                                return (
                                    <div
                                        key={bid.id}
                                        className="flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3 shadow-sm"
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* TODO: here we have to show the real profile image of the user but for now we are using the temp image */}
                                            <img
                                                src={profileImageTemp}
                                                alt="User Avatar"
                                                className="h-10 w-10 rounded-full object-cover"
                                            />

                                            <div>
                                                <p className="text-sm font-semibold text-blue-700">
                                                    {bid.member?.username ?? "Unknown"}
                                                </p>
                                                <p className="text-xs text-gray-500">#{idx + 1}</p>
                                            </div>
                                        </div>

                                        <div className="text-sm font-semibold text-gray-900">₹ {bid.amount}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Bidding;
