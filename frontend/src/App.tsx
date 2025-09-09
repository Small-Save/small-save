import React from "react";
import { Redirect, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import Home from "./pages/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "./theme/variables.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import OtpVerificationPage from "./pages/Login/OtpVerificationPage";
import { AuthProvider } from "./contexts/AuthProvider";
import OnBaord from "./pages/Login/onboard";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoutes";

setupIonicReact({
    mode: "md"
});

const App: React.FC = () => (
    <IonApp>
        <AuthProvider>
            <IonReactRouter>
                <IonRouterOutlet>
                    {/* TODO: add login to check if user is authenticated if yes take hime to home page */}

                    {/* Public pages → redirect if already logged in */}
                    <Route exact path="/">
                        <Redirect to="/login" />
                    </Route>
                    <Route exact path="/login">
                        <PublicRoute component={Login} />
                    </Route>
                    <Route exact path="/verify_otp">
                        <PublicRoute component={OtpVerificationPage} />
                    </Route>
                    <Route exact path="/register">
                        <PublicRoute component={Register} />
                    </Route>

                    {/* Protected pages → must be logged in */}
                    <Route exact path="/home">
                        <ProtectedRoute component={Home} />
                    </Route>
                    <Route exact path="/onboard">
                        <OnBaord/>
                    </Route>
                </IonRouterOutlet>
            </IonReactRouter>
        </AuthProvider>
    </IonApp>
);

export default App;
