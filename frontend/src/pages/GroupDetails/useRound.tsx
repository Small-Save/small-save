import { create } from "zustand";

interface RoundStore {
    roundId: number | null;
    setRoundId: (roundId: number) => void;
}

const useRoundStore = create<RoundStore>((set) => ({
    roundId: null,
    setRoundId: (roundId: number) => set({ roundId })
}));

export default useRoundStore;
