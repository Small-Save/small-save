import { useCountdown } from "Hooks/useCountDown";
import { formatAmount } from "lib/utils";
import { BiddingRound } from "pages/Bidding/services";

interface BiddingInfoCardProps {
    currentRound: BiddingRound;
    totalRounds: number;
    totalAmount: number;
    monthlyPool: number;
    duration: number;
    paidCount: number;
    totalPayments: number;
}

export const BiddingInfoCard: React.FC<BiddingInfoCardProps> = ({
    currentRound,
    totalRounds,
    totalAmount,
    monthlyPool,
    duration,
    paidCount,
    totalPayments
}) => {
    const progressPercentage = totalPayments > 0 ? (paidCount / totalPayments) * 100 : 0;
    const countdown = useCountdown(currentRound?.status === "scheduled" ? currentRound.scheduled_time : undefined);
    const statusBadge = (() => {
        switch (currentRound?.status) {
            case "scheduled":
                return <span className="text-sm  text-dark">{countdown || "0h 0m 0s"}</span>;
            case "active":
                return <span className="text-sm  text-green-500">LIVE</span>;
            case "completed":
                return <span className="text-sm  text-gray-400">COMPLETED</span>;
            default:
                return null;
        }
    })();

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <span className="bg-blue-50 text-primary text-xs font-semibold px-3 py-1.5 rounded-md tracking-wide">
                    ROUND {currentRound?.round_number} OF {totalRounds}
                </span>
                {statusBadge}
            </div>

            <p className="font-nexa text-4xl font-bold text-dark leading-tight mb-4">₹ {formatAmount(totalAmount)}</p>

            <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                    <span className=" text-sm">Monthly Pool</span>
                    <span className="text-sm">₹ {monthlyPool.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm">Duration</span>
                    <span className=" text-sm">{duration} Months</span>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Payment Progress</span>
                    <span className="text-sm">
                        {paidCount}/{totalPayments}
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
