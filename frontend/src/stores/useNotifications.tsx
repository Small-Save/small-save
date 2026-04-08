import { create } from "zustand";

interface NotificationStore {
    unreadCount: number;
    setUnreadCount: (count: number) => void;
    incrementUnread: () => void;
    resetUnread: () => void;
}

const useNotificationStore = create<NotificationStore>((set) => ({
    unreadCount: 0,
    setUnreadCount: (count: number) => set({ unreadCount: count }),
    incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
    resetUnread: () => set({ unreadCount: 0 }),
}));

export default useNotificationStore;
