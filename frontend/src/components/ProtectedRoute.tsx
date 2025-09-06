// src/components/ProtectedRoute.tsx
import React, { useContext } from "react";
import { IonPage, IonContent, IonSpinner } from "@ionic/react";
import { Redirect, RouteProps } from "react-router-dom";
import { AuthContext } from "../contexts/AuthProvider";

interface ProtectedRouteProps extends RouteProps {
    component: React.ComponentType<any>;
    redirectIfAuth?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component, redirectIfAuth, ...rest }) => {
    const { user, loading } = useContext(AuthContext)!;

    if (loading) {
        return (
            <IonPage>
                <IonContent className="ion-padding flex justify-center items-center">
                    <IonSpinner name="crescent" />
                </IonContent>
            </IonPage>
        );
    }

    if (user && redirectIfAuth) {
        return <Redirect to={redirectIfAuth} />;
    }

    if (!user) {
        return <Redirect to="/login" />;
    }

    return <Component {...rest} />;
};

export default ProtectedRoute;
