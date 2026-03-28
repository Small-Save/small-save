import React from "react";

import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Route } from "react-router-dom";

import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
/* Ionic CSS imports */
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "./theme/variables.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

import { GroupCreationProvider } from "contexts/GroupCreationContext";
import Bidding from "pages/Bidding/Bidding";
import { Toaster } from "components/Toaster";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoutes";
import { AuthProvider } from "./contexts/AuthProvider";
import AddMembers from "./pages/CreateGroup/AddMembers";
import CreateGroup from "./pages/CreateGroup/CreateNewGroup";
import OnBoard from "./pages/Login/onboard";
import OtpVerificationPage from "./pages/Login/OtpVerificationPage";

setupIonicReact({ mode: "md" });
const queryClient = new QueryClient();
const App: React.FC = () => (
    <IonApp>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <IonReactRouter>
                    <IonRouterOutlet>
                        {/* Default */}
                        <Route exact path="/">
                            <Redirect to="/login" />
                        </Route>

                        {/* Public */}
                        <Route exact path="/login">
                            <PublicRoute component={Login} />
                        </Route>
                        <Route exact path="/verify_otp">
                            <PublicRoute component={OtpVerificationPage} />
                        </Route>
                        <Route exact path="/register">
                            <PublicRoute component={Register} />
                        </Route>

                        {/* Protected */}
                        <Route exact path="/home">
                            <ProtectedRoute component={Home} />
                        </Route>

                        <Route exact path="/onboard">
                            <ProtectedRoute component={OnBoard} />
                        </Route>

                        {/* Group routes - shared context */}
                        <GroupCreationProvider>
                            <Route exact path="/group/new">
                                <ProtectedRoute component={CreateGroup} />
                            </Route>
                            <Route exact path="/group/new/members">
                                <ProtectedRoute component={AddMembers} />
                            </Route>
                        </GroupCreationProvider>

                        <Route exact path="/group/:groupId/bidding">
                            <ProtectedRoute component={Bidding} />
                        </Route>
                    </IonRouterOutlet>
                </IonReactRouter>
            </AuthProvider>
        </QueryClientProvider>
        <Toaster />
    </IonApp>
);

export default App;
