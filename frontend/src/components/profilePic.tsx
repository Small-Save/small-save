import React, { useMemo, useState } from "react";

import profileFallback from "assets/images/profileImageTemp.jpg";

export type ProfilePicVariant = "circle" | "squircle";

export type ProfilePicStatus = "online" | "offline";

export type ProfilePicProps = {
    /** Remote or absolute URL; empty uses the default avatar image. */
    src?: string | null;
    /** Square size in CSS pixels (width and height). Default 48. */
    size?: number;
    /**
     * `circle` — full circle with a light ring (good on dark headers).
     * `squircle` — rounded square; use `status` for the bottom-right presence dot.
     */
    variant?: ProfilePicVariant;
    /** Presence dot at bottom-right (white ring + green or gray fill). */
    status?: ProfilePicStatus;
    alt?: string;
    className?: string;
};

function shapeClasses(variant: ProfilePicVariant): string {
    if (variant === "circle") {
        return "rounded-full";
    }
    return "rounded-2xl ";
}

export const ProfilePic: React.FC<ProfilePicProps> = ({
    src,
    size = 48,
    variant = "circle",
    status,
    alt = "Profile",
    className = ""
}) => {
    const [useFallback, setUseFallback] = useState(false);

    const resolvedSrc = useFallback || src == null || String(src).trim() === "" ? profileFallback : src;

    const badgeSize = useMemo(() => Math.max(10, Math.round(size * 0.28)), [size]);

    const shape = shapeClasses(variant);

    const imgProps = {
        src: resolvedSrc,
        alt,
        width: size,
        height: size,
        loading: "lazy" as const,
        decoding: "async" as const,
        onError: () => setUseFallback(true)
    };

    if (status == null) {
        return (
            <img
                {...imgProps}
                className={`inline-block shrink-0 object-cover aspect-square ${shape} ${className}`.trim()}
            />
        );
    }

    return (
        <div className={`relative inline-block shrink-0 ${className}`.trim()} style={{ width: size, height: size }}>
            <img {...imgProps} className={`h-full w-full object-cover ${shape}`} />
            <span
                className={`absolute rounded-full border-[3px] border-white shadow-sm ${
                    status === "online" ? "bg-emerald-500" : "bg-neutral-400"
                }`}
                style={{
                    width: badgeSize,
                    height: badgeSize,
                    bottom: Math.max(1, Math.round(size * 0.02)),
                    right: Math.max(1, Math.round(size * 0.02))
                }}
                aria-hidden
                title={status === "online" ? "Online" : "Offline"}
            />
        </div>
    );
};
