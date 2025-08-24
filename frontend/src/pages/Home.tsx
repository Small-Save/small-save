import React from "react";
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from "@ionic/react";
import { IonRouterLink } from "@ionic/react";

const Home: React.FC = () => {
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Home Page</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <p>Welcome to the home page!</p>
                <IonRouterLink routerLink="/details">
                    Go to details
                </IonRouterLink>
            </IonContent>
        </IonPage>
    );
};

export default Home;
