import React from "react";
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon } from "@ionic/react";
import { addOutline } from 'ionicons/icons';
import { useHistory } from "react-router";

const Home: React.FC = () => {
    const history = useHistory()
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Home Page</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <p>Welcome to the home page!</p>

                <IonButton onClick={()=>{history.push('/createNewGroup')}} >
                    <IonIcon slot="icon-only" icon={addOutline}></IonIcon>
                </IonButton>
            </IonContent>
        </IonPage>
    );
};

export default Home;
