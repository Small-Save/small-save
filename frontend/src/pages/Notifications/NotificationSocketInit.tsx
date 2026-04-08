import { AuthContext } from "contexts/AuthProvider";

import { useNotificationSocket } from "./useNotificationSocket";
import { useContext } from "react";

export function NotificationSocketInit() {
    const { user } = useContext(AuthContext)!;

    if (!user) return null;

    return <NotificationSocketInner />;
}

function NotificationSocketInner() {
    useNotificationSocket();
    return null;
}
