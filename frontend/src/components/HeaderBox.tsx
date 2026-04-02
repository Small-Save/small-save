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
        <IonHeader className={""}>
            <IonToolbar color="dark" aria-label={title} >
                <div className="grid grid-cols-3 items-center gap-4 w-full">
                    <div>
                        {showBack && (
                            <IonButtons slot="start">
                                <IonButton aria-label="Go back" fill="solid" shape="round" onClick={handleBack}>
                                    <IonIcon icon={arrowBack} />
                                </IonButton>
                            </IonButtons>
                        )}
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <IonTitle>{title}</IonTitle>
                        {subTitle && (
                            <p className="text-sm" aria-label="subtitle">
                                {subTitle}
                            </p>
                        )}
                    </div>
                    <div>
                        {actions && actions.length > 0 && (
                            <>
                                {actions.map((action) => (
                                    <IonButtons key={action.key} slot={action.slot || "end"}>
                                        {action.element}
                                    </IonButtons>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </IonToolbar>
        </IonHeader>
    );
};
