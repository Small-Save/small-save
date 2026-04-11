import React, { useContext } from "react";

import { IonButton, IonContent, IonIcon, IonPage } from "@ionic/react";
import { logOutOutline } from "ionicons/icons";

import { HeaderBox } from "components/HeaderBox";
import { AuthContext } from "contexts/AuthProvider";
import BottomNav from "components/BottomNav";

const AccountPage: React.FC = () => {
    const { logout } = useContext(AuthContext)!;
    return (
        <IonPage>
            <HeaderBox title="Account" />
            <IonContent>
                <div>
                    {/* Logout Button */}
                    <IonButton className="flex gap-1 items-center" onClick={() => logout()} fill="clear">
                        <IonIcon icon={logOutOutline} />
                        Logout
                    </IonButton>
                </div>
            </IonContent>
            <BottomNav />
        </IonPage>
    );
};

export default AccountPage;
