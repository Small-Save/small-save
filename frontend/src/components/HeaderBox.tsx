import React, { useCallback } from "react";

import { IonButton, IonButtons, IonHeader, IonIcon, IonTitle, IonToolbar, useIonRouter } from "@ionic/react";
import { arrowBack } from "ionicons/icons";

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
}

export const HeaderBox: React.FC<HeaderBoxProps> = ({
    title,
    subTitle,
    actions,
    showBack = true,
    onBack,
    className
}) => {
    const ionRouter = useIonRouter();

    const handleBack = useCallback(() => {
        if (onBack) return onBack();
        ionRouter.goBack();
    }, [onBack, ionRouter]);

    return (
        <IonHeader className={className}>
            <IonToolbar color="dark" aria-label={title}>
                {showBack && (
                    <IonButtons slot="start">
                        <IonButton aria-label="Go back" fill="solid" shape="round" onClick={handleBack}>
                            <IonIcon icon={arrowBack} />
                        </IonButton>
                    </IonButtons>
                )}
                <div className="flex flex-col items-center flex-1 text-center">
                    <IonTitle>{title}</IonTitle>
                    {subTitle && (
                        <p className="text-sm" aria-label="subtitle">
                            {subTitle}
                        </p>
                    )}
                </div>
                {actions && actions.length > 0 && (
                    <>
                        {actions.map((action) => (
                            <IonButtons key={action.key} slot={action.slot || "end"}>
                                {action.element}
                            </IonButtons>
                        ))}
                    </>
                )}
            </IonToolbar>
        </IonHeader>
    );
};
