import React from "react";

import { IonButton, IonContent, IonIcon, IonPage } from "@ionic/react";
import { logOutOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";

import { HeaderBox } from "components/HeaderBox";
import { useAuthStore } from "contexts/AuthProvider";

const AccountPage: React.FC = () => {
    const logout = useAuthStore((s) => s.logout);
    const history = useHistory();

    const handleLogout = async () => {
        await logout();
        history.replace("/login");
    };

    return (
        <IonPage>
            <HeaderBox title="Account" />
            <IonContent className="">
                <div className="">
                    {/* Logout Button */}
                    <IonButton className="flex gap-1 items-center" onClick={handleLogout} fill="clear">
                        <IonIcon icon={logOutOutline} className="" />
                        Logout
                    </IonButton>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default AccountPage;
