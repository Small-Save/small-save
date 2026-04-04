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

import { Toaster } from "components/Toaster";
import { GroupCreationProvider } from "contexts/GroupCreationContext";
import AccountPage from "pages/Account/account";
import Bidding from "pages/Bidding/Bidding";
import GroupDetail from "pages/GroupDetails/GroupDetails";
import Payments from "pages/Payment/Payments";

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
            <IonReactRouter>
                <AuthProvider>
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

                        {/* Protected pages */}
                        <Route exact path="/home">
                            <ProtectedRoute component={Home} />
                        </Route>

                        <Route exact path="/onboard">
                            <ProtectedRoute component={OnBoard} />
                        </Route>

                        <Route exact path="/notifications">
                            <ProtectedRoute component={OnBoard} />
                        </Route>

                        <Route exact path="/account">
                            <ProtectedRoute component={AccountPage} />
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

                        <Route exact path="/groupdetail/:groupId">
                            <ProtectedRoute component={GroupDetail} />
                        </Route>

                        <Route exact path="/payments/:roundId">
                            <ProtectedRoute component={Payments} />
                        </Route>

                        {/* Bidding routes */}
                        <Route exact path="/group/:groupId/bidding">
                            <ProtectedRoute component={Bidding} />
                        </Route>
                    </IonRouterOutlet>
                </AuthProvider>
            </IonReactRouter>
        </QueryClientProvider>
        <Toaster />
    </IonApp>
);

export default App;
