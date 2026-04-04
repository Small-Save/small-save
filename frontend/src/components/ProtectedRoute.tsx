// src/components/ProtectedRoute.tsx
import React from "react";

import { IonContent, IonPage, IonSpinner } from "@ionic/react";
import { Redirect, RouteProps } from "react-router-dom";

import { useAuthStore } from "../contexts/AuthProvider";

interface ProtectedRouteProps extends RouteProps {
    component?: React.ComponentType<any>;
    children?: React.ReactNode;
    redirectIfNotAuth?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    component: Component,
    children,
    redirectIfNotAuth = "/login",
    ...rest
}) => {
    const { user, loading } = useAuthStore();

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

    if (Component) {
        return <Component {...rest} />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
