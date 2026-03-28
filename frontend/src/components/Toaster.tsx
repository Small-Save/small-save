import { IonToast } from "@ionic/react";

import { dismissToast, useToast, type ToastState } from "Hooks/useToast";

export function Toaster() {
    const { toasts } = useToast();

    return (
        <>
            {toasts.map((t: ToastState) => (
                <IonToast
                    key={t.id}
                    isOpen={t.isOpen}
                    header={t.header}
                    message={t.message}
                    duration={t.duration}
                    color={t.color}
                    position={t.position}
                    onDidDismiss={() => dismissToast(t.id)}
                />
            ))}
        </>
    );
}
