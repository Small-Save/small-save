import React from "react";

import { IonIcon } from "@ionic/react";
import { calendarClearOutline, checkmarkCircleOutline, peopleOutline, timeOutline } from "ionicons/icons";
import { useHistory } from "react-router";
import useGroupStore from "stores/useGroup";

import profileImageTemp from "assets/images/profileImageTemp.jpg";
import { ProfilePic } from "components/profilePic";
import { BiddingRound } from "pages/Bidding/services";
import { Group } from "types";

interface GroupCardProps {
    group: Group;
}

interface StatusBadge {
    label: string;
    icon: string;
    className: string;
}

function getStatusBadge(round: BiddingRound | null | undefined): StatusBadge | null {
    if (!round) return null;

    if (round.status === "completed") {
        return {
            label: "Paid",
            icon: checkmarkCircleOutline,
            className: "border border-green-500 text-green-600 bg-green-50"
        };
    }

    if (round.status === "active" && round.end_time) {
        const days = Math.ceil((new Date(round.end_time).getTime() - Date.now()) / 86_400_000);
        return {
            label: days <= 0 ? "Due today" : `Due in ${days} days`,
            icon: timeOutline,
            className: "border border-orange-400 text-orange-500 bg-orange-50"
        };
    }

    if (round.status === "scheduled") {
        return {
            label: "Upcoming",
            icon: calendarClearOutline,
            className: "border border-blue-400 text-blue-500 bg-blue-50"
        };
    }

    return null;
}

const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
    const history = useHistory();
    const { setGroup } = useGroupStore();

    const handleClick = () => {
        setGroup(group);
        history.push(`/groupdetail/${group.id}/`);
    };

    const progress = Math.min((group.members.length / group.size) * 100, 100);
    // TODO: Change this
    const status = getStatusBadge(group.current_bidding_round);

    return (
        <div onClick={handleClick} className="w-full bg-white rounded-2xl shadow-sm px-4 py-2 mb-3 text-left">
            {/* Avatar + group info */}
            <div className="grid grid-cols-4 items-center gap-3 mb-2">
                <ProfilePic src={profileImageTemp} variant="circle" size={56} />
                <div className=" space-y-2 col-span-3">
                    <span className="text-lg m-0 truncate">{group.name}</span>
                    <div className="flex items-center gap-3 text-primary/50 text-xs">
                        <span className="flex items-center gap-1">
                            <IonIcon icon={peopleOutline} />
                            {group.members.length} members
                        </span>
                        <span className="flex items-center gap-1">
                            <IonIcon icon={calendarClearOutline} />
                            {/* TODO: Fix this to show the actual duration */}
                            {group.duration}/{group.duration} Months
                        </span>
                    </div>

                    {/* Amount + status badge */}
                    <div className="flex items-center gap-3">
                        <span className="text-lg">
                            $ {Number(group.target_amount).toLocaleString()}
                        </span>

                        {status && (
                            <span
                                className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full ${status.className}`}
                            >
                                <IonIcon icon={status.icon} />
                                {status.label}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <div>
                <div className="flex justify-between text-xs text-primary/50 mb-1.5">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
                </div>
            </div>
        </div>
    );
};

export default GroupCard;
