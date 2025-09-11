// src/components/ProtectedRoute.tsx
import React, { useContext } from "react";
import { IonPage, IonContent, IonSpinner } from "@ionic/react";
import { Redirect, RouteProps } from "react-router-dom";
import { AuthContext } from "../contexts/AuthProvider";

interface ProtectedRouteProps extends RouteProps {
    component: React.ComponentType<any>;
    redirectIfNotAuth?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    component: Component,
    redirectIfNotAuth = "/login",
    ...rest
}) => {
    const { user, loading } = useContext(AuthContext)!;

    if (loading) {
        return (
            <IonPage>
                <IonContent className="ion-padding flex justify-center items-center">
                    {/* Change this our loading icon */}
                    <IonSpinner name="crescent" />
                </IonContent>
            </IonPage>
        );
    }

    if (!user) {
        return <Redirect to={redirectIfNotAuth} />;
    }

    return <Component {...rest} />;
};

export default ProtectedRoute;
