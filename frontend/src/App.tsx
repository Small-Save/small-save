import React from "react";
import { Redirect, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
import OtpVerificationPage from "./pages/Login/OtpVerificationPage";
import { AuthProvider } from "./contexts/AuthProvider";
import OnBoard from "./pages/Login/onboard";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoutes";
import CreateGroup from "./pages/CreateGroup/CreateNewGroup";
import AddMembers from "./pages/CreateGroup/AddMembers";
import { GroupCreationProvider } from "contexts/GroupCreationContext";
import GroupDetail from "pages/GroupDetails/GroupDetails";
import Bidding from "pages/Bidding/Bidding";
import Payment from "pages/Payment/Payment"
import RoundTransactions from "pages/GroupDetails/History/RoundTransactions/RoundTransactions";
import Account from "pages/Account/Account";

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

                        {/* Protected pages */}
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
                        <Route exact path="/groupdetail/:groupId/:groupName">
                            <ProtectedRoute component={GroupDetail} />
                        </Route>

                        <Route exact path="/payment/:paymentId">
                            <ProtectedRoute component={Payment} />
                        </Route>
                        <Route exact path="/round-transactions">
                            <ProtectedRoute component={RoundTransactions} />
                        </Route>

                        {/* Bidding routes */}
                        <Route exact path="/group/:groupId/bidding">
                            <ProtectedRoute component={Bidding} />
                        </Route>
                        <Route exact path="/account">
                            <ProtectedRoute component={Account} />
                        </Route>
                    </IonRouterOutlet>
                </IonReactRouter>
            </AuthProvider>
        </QueryClientProvider>
    </IonApp>
);

export default App;
