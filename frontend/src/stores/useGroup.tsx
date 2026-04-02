import { Group } from 'types';
import { create } from 'zustand'
interface GroupStore {
    group: Group | null;
    setGroup: (group: Group) => void;
}
const useGroupStore = create<GroupStore>((set) => ({
    group: null,
    setGroup: (group: Group) => set({ group })
}))
export default useGroupStore;