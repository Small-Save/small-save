import { IonPage, IonContent, IonInput, IonButton } from "@ionic/react";
import validatePhoneNumber from "../../utils/utils";
import useFormInput from "../../Hooks/useFormInput";
import { useState } from "react";
import { useHistory } from "react-router-dom";

export default function Login() {
    const history = useHistory();
    const phone = useFormInput("+91", validatePhoneNumber);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleLogin = async () => {
        if (!phone.isValid) {
            return;
        }
        try {
            setIsLoading(true);
            // const response = await api.post("/login");
            history.push("/verify_otp", { phone: phone.value });
        } catch {
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <IonPage>
            <IonContent className="ion-padding">
                <div className="flex items-center justify-center h-full">
                    <div className="max-w-md w-full space-y-6">
                        {/* Title */}
                        <div className="text-center">
                            <h1 className="text-2xl font-bold">Sign In</h1>
                            <p className="text-gray-500 mt-2">
                                Hello, welcome to <span className="font-semibold">Small save</span>
                            </p>
                        </div>

                        {/* Phone Input */}

                        <IonInput
                            className={`${phone.isValid === false && "ion-invalid"} ${phone.touched && "ion-touched"}`}
                            type="tel"
                            label="Phone Number"
                            placeholder="Enter phone number"
                            labelPlacement="floating"
                            maxlength={14}
                            {...phone.bind}
                        />

                        {/* Login Button */}
                        <IonButton expand="block" onClick={handleLogin}>
                            LOGIN
                        </IonButton>

                        {/* Checkbox & Terms */}
                        <div className="flex items-center justify-center text-center space-x-2 text-xs text-gray-500 ml-8 mr-8">
                            {/* <IonCheckbox /> */}
                            <span>
                                By continuing you agree to accept our{" "}
                                <a href="#" color={"primary"}>
                                    privacy policy
                                </a>{" "}
                                and{" "}
                                <a href="#" color="primary">
                                    terms of service
                                </a>
                                .
                            </span>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center space-x-2">
                            <div className="flex-1 h-px bg-gray-300" />
                            <span className="text-gray-500 text-sm">or Sign in with Google</span>
                            <div className="flex-1 h-px bg-gray-300" />
                        </div>

                        {/* Google Button */}
                        {/* TODO: fix the UI of this later */}
                        <IonButton expand="block" className="rounded-lg">
                            {/* <div className="flex items-center justify-center gap-2 w-full py-2">
                                <img src="/src/assets/images/google.png" alt="Google" className="w-5 h-5" /> */}
                            <span>SIGN UP WITH GOOGLE</span>
                            {/* </div> */}
                        </IonButton>

                        {/* Footer */}
                        <div className="text-center text-sm">
                            Not registered yet?{" "}
                            <a href="#" className="text-indigo-500 font-medium">
                                Create an Account
                            </a>
                        </div>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
}
