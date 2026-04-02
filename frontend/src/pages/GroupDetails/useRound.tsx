import { create } from 'zustand'
interface RoundStore {
    roundId: number;
    setRoundId: (roundId: number) => void;
}

const useRoundStore = create<RoundStore>((set) => ({
    roundId: 1,
    setRoundId: (roundId: number) => set({ roundId })
}))

export default useRoundStore;