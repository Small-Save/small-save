import { create } from "zustand";

import { Group } from "types";

interface GroupStore {
    group: Group | null;
    setGroup: (group: Group) => void;
}
const useGroupStore = create<GroupStore>((set) => ({
    group: null,
    setGroup: (group: Group) => set({ group })
}));
export default useGroupStore;
