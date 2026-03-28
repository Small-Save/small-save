import React, { useContext } from "react";

import { IonButton, IonContent, IonIcon, IonPage } from "@ionic/react";
import { logOutOutline } from "ionicons/icons";
import { AuthContext } from "contexts/AuthProvider";
import { HeaderBox } from "components/HeaderBox";

const AccountPage: React.FC = () => {
    const { logout } = useContext(AuthContext)!;
    return (
        <IonPage>
            <HeaderBox title="Account"/>
            <IonContent className="">
                <div className="">
                    {/* Logout Button */}
                    <IonButton className="flex gap-1 items-center" onClick={() => logout()} fill="clear">
                        <IonIcon icon={logOutOutline} className="" />
                        Logout
                    </IonButton>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default AccountPage;
