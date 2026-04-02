import { useEffect, useState } from "react";

import { IonButton, IonIcon } from "@ionic/react";
import { notificationsOutline } from "ionicons/icons";

import { formatAmount, formatAmountCompact, getInitials } from "lib/utils";
import { Group } from "types";

import { BiddingRound } from "./services";

interface ScheduledBiddingRoundProps {
    formattedSchedule: string;
    group: Group | undefined;
    round: BiddingRound | undefined;
    onNotifyMe?: () => void;
}

export const ScheduledBiddingRound: React.FC<ScheduledBiddingRoundProps> = ({
    formattedSchedule,
    group,
    round,
    onNotifyMe
}) => {
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        if (!round?.scheduled_time) return;
        const update = () => {
            const now = Date.now();
            const start = new Date(round.scheduled_time).getTime();
            const diff = Math.max(0, start - now);
            setCountdown({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / (1000 * 60)) % 60),
                seconds: Math.floor((diff / 1000) % 60)
            });
        };
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, [round?.scheduled_time]);

    const members = group?.members ?? [];
    const memberCount = members.length;
    const totalSize = group?.size ?? 0;
    const displayMembers = members.slice(0, 4);

    return (
        <div className="flex flex-col space-y-6 pb-8">
            <div className="flex flex-col items-center gap-6">
                <div className="inline-flex items-center gap-2 bg-[#4caf50] text-white py-2 px-5 rounded-full text-xs font-semibold tracking-wider uppercase">
                    <span className="w-2 h-2 rounded-full bg-white" />
                    UPCOMING
                </div>
                <div className="w-full">
                    <p className="text-center text-xs tracking-widest mb-3">BIDDING STARTS IN</p>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                        <div className="rounded-3xl p-6 text-white shadow-xl bg-linear-to-br from-purple-600 to-indigo-600">
                            <div className="text-3xl font-bold ">{String(countdown.days).padStart(2, "0")}</div>
                            <div className="text-[11px] text-white/80 uppercase tracking-wider mt-1">Days</div>
                        </div>
                        <span className=" text-2xl font-bold">:</span>
                        <div
                            className="rounded-3xl p-6 text-white shadow-xl
                        bg-linear-to-br from-purple-600 to-indigo-600"
                        >
                            <div className="text-3xl font-bold ">{String(countdown.hours).padStart(2, "0")}</div>
                            <div className="text-[11px] text-white/80 uppercase tracking-wider mt-1">Hours</div>
                        </div>
                        <span className=" text-2xl font-bold">:</span>
                        <div
                            className="rounded-3xl p-6 text-white shadow-xl
                        bg-linear-to-br from-purple-600 to-indigo-600"
                        >
                            <div className="text-3xl font-bold ">{String(countdown.minutes).padStart(2, "0")}</div>
                            <div className="text-[11px] text-white/80 uppercase tracking-wider mt-1">Minutes</div>
                        </div>
                        {countdown.days === 0 && (
                            <>
                                <span className=" text-2xl font-bold">:</span>
                                <div
                                    className="rounded-3xl p-6 text-white shadow-xl
                        bg-linear-to-br from-purple-600 to-indigo-600"
                                >
                                    <div className="text-3xl font-bold ">
                                        {String(countdown.seconds).padStart(2, "0")}
                                    </div>
                                    <div className="text-[11px] text-white/80 uppercase tracking-wider mt-1">
                                        Seconds
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full">
                    <div className="rounded-3xl p-6 text-white shadow-xl bg-linear-to-br from-purple-600 to-indigo-600">
                        <div className="text-[13px] text-white/80 mb-2">Total Pool Amount</div>
                        <div className="text-[22px] font-bold ">₹{formatAmount(group?.target_amount ?? 0)}</div>
                    </div>
                    {/* <div className="rounded-3xl p-6 text-white shadow-xl bg-linear-to-br from-purple-600 to-indigo-600">
                        <div className="text-[13px] text-white/80 mb-2">Previous Winner</div>
                        TODO: check this if this is working. showing previous winner
                        {round?.winner.username ? (
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-[#2A2A3D] border-2 border-[#4caf50] flex items-center justify-center text-xs font-semibold ">
                                    {getInitials(round.winner.username)}
                                </div>
                                <span className="text-sm">
                                    {round.winner.username}{" "}
                                    <span className="text-white/70">
                                        ({round.winning_bid ? `₹${formatAmountCompact(round.winning_bid)}` : "—"})
                                    </span>
                                </span>
                            </div>
                        ) : (
                            <span className="text-white/70 text-sm">—</span>
                        )}
                    </div> */}
                </div>
                {onNotifyMe && (
                    <div className="w-full space-y-2">
                        <IonButton className="w-full h-12" onClick={onNotifyMe}>
                            <IonIcon icon={notificationsOutline} className="mr-2" />
                            NOTIFY ME
                        </IonButton>
                        <p className="text-center text-xs">
                            You will receive a push notification 5 minutes before the bidding starts.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
