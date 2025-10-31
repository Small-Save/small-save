import React from "react";
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon } from "@ionic/react";
import { addOutline } from "ionicons/icons";
import { useIonRouter } from "@ionic/react";

const Home: React.FC = () => {
    const ionRouter = useIonRouter();

    const handleCreateGroup = () => {
        ionRouter.push("/group/new", "forward");
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Home Page</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <p>Welcome to the home page!</p>

                <IonButton onClick={handleCreateGroup}>
                    <IonIcon slot="icon-only" icon={addOutline}></IonIcon>
                </IonButton>
            </IonContent>
        </IonPage>
    );
};

export default Home;
