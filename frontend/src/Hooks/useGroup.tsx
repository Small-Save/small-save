import { useQuery } from "@tanstack/react-query";
import { fetchGroupDetails } from "pages/Bidding/services";

export const useGroup = (groupId: string) => {
    return useQuery({
        queryKey: ["group", groupId],
        queryFn: () => fetchGroupDetails(groupId),
        enabled: Boolean(groupId), // only run when groupId exists
        staleTime: 1000 * 60 * 15, // cache for 5 mins
        gcTime: 1000 * 60 * 10
    });
};
