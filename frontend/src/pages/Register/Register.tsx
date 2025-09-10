import {
    IonButton,
    IonContent,
    IonIcon,
    IonInput,
    IonLabel,
    IonPage,
    IonSegment,
    IonSegmentButton
} from "@ionic/react";
import React, { useContext } from "react";
import ProfileImageInput from "../../components/CaptureImage/ProfileImageInput";
import useFormInput from "../../Hooks/useFormInput";
import { checkmarkCircle } from "ionicons/icons";
import "./Register.css";
import { AuthContext } from "../../contexts/AuthProvider";
import { useHistory, useLocation } from "react-router";

interface RouteParams {
    phone: string;
}

const Register: React.FC = () => {
    const location = useLocation<RouteParams>();
    const phone = location.state?.phone || "";
    const firstName = useFormInput("");
    const lastName = useFormInput("");
    const history = useHistory();
    const gender = useFormInput("male");
    const { register } = useContext(AuthContext)!;

    const handleRegister = async () => {
        if (!firstName.isValid && !lastName.isValid) {
            return;
        }

        try {
            const response = await register(phone, firstName.value, lastName.value, gender.value);
            if (response) {
                history.push("/onboard");
            }
        } catch {
        } finally {
        }
    };

    return (
        <IonPage>
            <IonContent>
                <div className="flex flex-col items-center justify-center h-full">
                    <div className="max-w-md w-full space-y-8">
                        <div className="text-center ">
                            <h1 className="text-2xl font-bold">Join the club</h1>
                            <p className="text-gray-500 mt-2">
                                Please provide your name and an optional profile picture
                            </p>
                        </div>
                        <ProfileImageInput />
                        <IonInput
                            className={`${firstName.isValid === false && "ion-invalid"} ${
                                firstName.touched && "ion-touched"
                            }`}
                            label="First name"
                            labelPlacement="floating"
                            placeholder="John"
                            {...firstName.bind}
                        />
                        <IonInput
                            className={`${lastName.isValid === false && "ion-invalid"} ${
                                lastName.touched && "ion-touched"
                            }`}
                            label="Last name"
                            labelPlacement="floating"
                            placeholder="Doe"
                            {...lastName.bind}
                        />
                        {/* <IonRadioGroup className="flex justify-around gap-1">
                            <IonRadio labelPlacement="end" >Male</IonRadio>

                            <IonRadio labelPlacement="end">Female</IonRadio>

                            <IonRadio labelPlacement="end">Others</IonRadio>
                        </IonRadioGroup> */}
                        <IonSegment {...gender.bind} className="gender-segment">
                            <IonSegmentButton value="male">
                                {gender.value === "male" && <IonIcon icon={checkmarkCircle} color="success" />}
                                <IonLabel>Male</IonLabel>
                            </IonSegmentButton>

                            <IonSegmentButton value="female">
                                {gender.value === "female" && <IonIcon icon={checkmarkCircle} color="success" />}
                                <IonLabel>Female</IonLabel>
                            </IonSegmentButton>

                            <IonSegmentButton value="others">
                                {gender.value === "others" && <IonIcon icon={checkmarkCircle} color="success" />}
                                <IonLabel>Others</IonLabel>
                            </IonSegmentButton>
                        </IonSegment>
                        <IonButton expand="block" onClick={handleRegister}>
                            {" "}
                            SUBMIT{" "}
                        </IonButton>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Register;
