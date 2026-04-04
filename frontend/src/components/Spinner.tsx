import { IonSpinner } from "@ionic/react";

export const Spinner = () => {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <IonSpinner name="crescent" />
        </div>
    );
};
