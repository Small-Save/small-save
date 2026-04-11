import React, { useCallback } from "react";

import { IonButton, IonButtons, IonHeader, IonIcon, IonToolbar, useIonRouter } from "@ionic/react";
import { arrowBack } from "ionicons/icons";

import { ProfilePic } from "./profilePic";

interface HeaderAction {
    key: string;
    element: React.ReactNode;
    slot?: "start" | "end"; // default end
}

interface HeaderBoxProps {
    title: string;
    subTitle?: string;
    actions?: HeaderAction[];
    showBack?: boolean;
    onBack?: () => void;
    className?: string;
    image?: string | null;
    children?: React.ReactNode;
}

export const HeaderBox: React.FC<HeaderBoxProps> = ({
    title,
    subTitle,
    actions,
    showBack = true,
    onBack,
    image,
    className,
    children
}) => {
    const ionRouter = useIonRouter();

    const handleBack = useCallback(() => {
        if (onBack) return onBack();
        ionRouter.goBack();
    }, [onBack, ionRouter]);

    const Image = useCallback(() => {
        if (image !== undefined) return <ProfilePic src={image} variant="circle" size={44} />;
        return null;
    }, [image]);

    return (
        <IonHeader className={className ?? ""}>
            <IonToolbar color="dark" aria-label={title}>
                <div className="px-4 pb-4">
                <div className="flex items-center w-full gap-3 min-h-22">
                    {/* Left zone — fixed width so center never shifts */}
                    {showBack && (
                        <div className="w-10 shrink-0 flex items-center justify-start">
                            <IonButtons>
                                <IonButton aria-label="Go back" fill="solid" shape="round" onClick={handleBack}>
                                    <IonIcon icon={arrowBack} />
                                </IonButton>
                            </IonButtons>
                        </div>
                    )}

                    {/* Center zone — grows to fill remaining space */}
                    <div className="flex flex-1 items-center gap-3 min-w-0">
                        <Image />
                        <div className="flex flex-col min-w-0">
                            <span className="text-primary-contrast font-semibold text-base leading-tight truncate">
                                {title}
                            </span>
                            {subTitle && (
                                <span className="text-primary-contrast/75 text-sm leading-tight" aria-label="subtitle">
                                    {subTitle}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Right zone — fixed width so center never shifts */}
                    <div className="w-10 shrink-0 flex items-center justify-end">
                        {actions?.map((action) => (
                            <IonButtons key={action.key}>{action.element}</IonButtons>
                        ))}
                    </div>
                </div>
                {children && <div>{children}</div>}
                </div>
            </IonToolbar>
        </IonHeader>
    );
};
