// src/components/PublicRoute.tsx
import React, { useContext } from "react";
import { Redirect, RouteProps } from "react-router-dom";
import { AuthContext } from "../contexts/AuthProvider";

interface PublicRouteProps extends RouteProps {
    component: React.ComponentType<any>;
    redirectIfAuth?: string; // default: "/home"
}

const PublicRoute: React.FC<PublicRouteProps> = ({ component: Component, redirectIfAuth = "/home", ...rest }) => {
    const { user, loading } = useContext(AuthContext)!;

    if (loading) {
        return null; // or a spinner if you want
    }

    if (user) {
        if (!user.is_registered) {
            return <Redirect to="/onboard" />;
        }
        return <Redirect to={redirectIfAuth} />;
    }

    return <Component {...rest} />;
};

export default PublicRoute;
