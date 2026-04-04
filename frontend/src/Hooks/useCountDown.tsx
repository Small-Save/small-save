import { useEffect, useState } from "react";

export const useCountdown = (targetDate: string | undefined) => {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        if (!targetDate) return;

        const tick = () => {
            const diff = new Date(targetDate).getTime() - Date.now();
            if (diff <= 0) {
                setTimeLeft("0h 0m 0s");
                return false;
            }
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);
            setTimeLeft(`${h}h ${m}m ${s}s`);
            return true;
        };

        tick();
        const id = setInterval(() => {
            if (!tick()) clearInterval(id);
        }, 1000);
        return () => clearInterval(id);
    }, [targetDate]);

    return timeLeft;
}