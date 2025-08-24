import React from "react";
import { Redirect, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";


/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "./theme/global.css"
import "./theme/variables.css"

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';


setupIonicReact({
  mode: "md"
});

const App: React.FC = () => (
    <IonApp>
        <IonReactRouter>
      <IonRouterOutlet>
                {/* TODO: add login to check if user is authenticated if yes take hime to home page */}
                <Route exact path="/">
                    <Redirect to="/login" />
                </Route>
                <Route exact path="/home">
                    <Home />
                </Route>
                <Route exact path="/login">
                    <Login/>
                </Route>
            </IonRouterOutlet>
        </IonReactRouter>
    </IonApp>
);

export default App;
