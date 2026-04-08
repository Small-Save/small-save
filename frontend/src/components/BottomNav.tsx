import React from "react";

import { IonFooter, IonIcon, IonToolbar } from "@ionic/react";
import { home, homeOutline, notifications, notificationsOutline, person, personOutline } from "ionicons/icons";
import { useHistory, useLocation } from "react-router-dom";
import useNotificationStore from "stores/useNotifications";

const tabs = [
    { path: "/home", label: "Home", activeIcon: home, inactiveIcon: homeOutline },
    { path: "/notifications", label: "Alerts", activeIcon: notifications, inactiveIcon: notificationsOutline },
    { path: "/account", label: "Account", activeIcon: person, inactiveIcon: personOutline }
] as const;

const BottomNav: React.FC = () => {
    const history = useHistory();
    const location = useLocation();
    const { unreadCount } = useNotificationStore();

    const isActive = (path: string) => location.pathname === path;
    const goTo = (path: string) => {
        if (location.pathname !== path) history.push(path);
    };

    return (
        <IonFooter className="ion-no-border">
            <IonToolbar className="border-t border-gray-100 shadow-lg" style={{ "--background": "#ffffff" }}>
                <div className="flex justify-around items-center py-3 px-2">
                    {tabs.map(({ path, label, activeIcon, inactiveIcon }) => (
                        <button
                            key={path}
                            onClick={() => goTo(path)}
                            className={`flex flex-col items-center gap-1 transition-all duration-200 outline-none ${
                                isActive(path) ? "text-primary" : "text-gray-400"
                            }`}
                        >
                            <div
                                className={`p-2 rounded-xl transition-colors relative ${
                                    isActive(path) ? "bg-primary/5" : ""
                                }`}
                            >
                                <IonIcon
                                    icon={isActive(path) ? activeIcon : inactiveIcon}
                                    className="text-2xl"
                                />
                                {path === "/notifications" && unreadCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none px-1">
                                        {unreadCount > 99 ? "99+" : unreadCount}
                                    </span>
                                )}
                            </div>
                            <span className="text-xs uppercase tracking-widest font-extrabold">{label}</span>
                        </button>
                    ))}
                </div>
            </IonToolbar>
        </IonFooter>
    );
};

export default BottomNav;
