import React, { createContext, useContext, useState } from "react";

export type GroupDetails = {
    groupName: string;
    targetAmount: number;
    duration: number;
    groupSize: number;
    winnerMethod: "random" | "bidding";
    startDate?: string;
};

type GroupCreationContextType = {
    details: GroupDetails | null;
    setDetails: (d: GroupDetails) => void;
    reset: () => void;
};

const GroupCreationContext = createContext<GroupCreationContextType | undefined>(undefined);

export const GroupCreationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [details, setDetailsState] = useState<GroupDetails | null>(null);

    const setDetails = (d: GroupDetails) => setDetailsState(d);
    const reset = () => setDetailsState(null);

    return (
        <GroupCreationContext.Provider value={{ details, setDetails, reset }}>{children}</GroupCreationContext.Provider>
    );
};

export const useGroupCreation = () => {
    const ctx = useContext(GroupCreationContext);
    if (!ctx) throw new Error("useGroupCreation must be used within GroupCreationProvider");
    return ctx;
};
