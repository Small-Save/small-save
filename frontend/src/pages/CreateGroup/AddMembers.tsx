import { IonPage, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent } from "@ionic/react";
import { arrowBack } from "ionicons/icons";
import { useHistory } from "react-router";
import { fetchDeviceContacts } from "lib/utils";
import { useEffect, useState } from "react";
const AddMembers: React.FC = () => {
    const history = useHistory();
    const [existingUsers, setExistingUsers] = useState([]);
    const [inviteNeeded, setInviteNeeded] = useState([]);
    const handleFetch = async () => {
        try {
            const contacts = await fetchDeviceContacts();
        } catch (err) {
            console.error(err);
        }
    };
    useEffect(()=>{
        handleFetch();
    }, [])
    return (
        <>
            <IonPage>
                {/* Header */}
                <IonHeader>
                    <IonToolbar color="dark">
                        <IonButtons slot="start">
                            <IonButton onClick={() => history.goBack()}>
                                <IonIcon icon={arrowBack} />
                            </IonButton>
                        </IonButtons>
                        <div className="flex flex-col items-center">
                            <p className="text-lg">Create New Group</p>
                            <p className="text-sm">Add group members</p>
                        </div>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding" scrollY={false}></IonContent>
            </IonPage>
        </>
    );
};
export default AddMembers;
