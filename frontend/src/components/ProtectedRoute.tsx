// src/components/ProtectedRoute.tsx
import React, { useContext } from "react";
import { IonPage, IonContent, IonSpinner, IonRedirect } from "@ionic/react";
import { AuthContext } from "../contexts/AuthProvider";

interface ProtectedRouteProps {
    component: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component }) => {
    const { user, loading } = useContext(AuthContext)!;

    if (loading) {
        return (
            <IonPage>
                <IonContent className="ion-padding">
                    <IonSpinner name="crescent" />
                </IonContent>
            </IonPage>
        );
    }

    if (!user) {
        return <IonRedirect to="/login" />;
    }

    return component;
};

export default ProtectedRoute;
