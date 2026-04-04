import React, { useCallback } from "react";

import { IonButton, IonButtons, IonHeader, IonIcon, IonTitle, IonToolbar, useIonRouter } from "@ionic/react";
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
    image?: string;
}

export const HeaderBox: React.FC<HeaderBoxProps> = ({
    title,
    subTitle,
    actions,
    showBack = true,
    onBack,
    image,
    className
}) => {
    const ionRouter = useIonRouter();

    const handleBack = useCallback(() => {
        if (onBack) return onBack();
        ionRouter.goBack();
    }, [onBack, ionRouter]);

    const Image = useCallback(() => {
        if (image) return <ProfilePic src={image} variant="circle" size={44} />;
        return null;
    }, [image]);

    return (
        <IonHeader className={""}>
            <IonToolbar color="dark" aria-label={title}>
                <div className="grid grid-cols-5 items-center gap-4 w-full py-5">
                    <div className="col-span-1">
                        {showBack && (
                            <IonButtons slot="start">
                                <IonButton aria-label="Go back" fill="solid" shape="round" onClick={handleBack}>
                                    <IonIcon icon={arrowBack} />
                                </IonButton>
                            </IonButtons>
                        )}
                    </div>
                    <div className="flex flex-col col-span-3 gap-2 items-start text-left">
                        <Image />
                        <div className="flex flex-col items-start text-left">
                            <IonTitle>{title}</IonTitle>
                            {subTitle && (
                                <p className="text-sm" aria-label="subtitle">
                                    {subTitle}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="col-span-1">
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
