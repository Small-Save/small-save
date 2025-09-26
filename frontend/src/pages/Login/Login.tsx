import { IonPage, IonContent, IonInput, IonButton, IonRouterLink } from "@ionic/react";
import useFormInput from "../../Hooks/useFormInput";
import { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthProvider";
import { validatePhoneNumber } from "../../utils/utils";

const Login: React.FC = () => {
    const history = useHistory();
    const { sendOtp } = useContext(AuthContext)!;
    const phone = useFormInput<string>("", validatePhoneNumber);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleLogin = async () => {
        if (!phone.isValid) {
            return;
        }
        try {
            setIsLoading(true);
            const response = await sendOtp(phone.value);
            if (response) {
                history.push("/verify_otp", { phone: phone.value });
            }
        } catch {
        } finally {
            phone.setValue("");
            setIsLoading(false);
        }
    };

    return (
        <IonPage>
            <IonContent className="ion-padding" scrollY={false}>
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
                            maxlength={10}
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
                                <IonRouterLink routerLink="/privacy-policy">privacy policy </IonRouterLink>
                                and <IonRouterLink routerLink="/terms-of-service">terms of service</IonRouterLink>.
                            </span>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center space-x-2">
                            <div className="flex-1 h-px bg-gray-300" />
                            <span className="text-gray-500 text-sm">or Sign in with Google</span>
                            <div className="flex-1 h-px bg-gray-300" />
                        </div>

                        {/* Google Button */}
                        <IonButton expand="block" className="rounded-lg">
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
};
export default Login;