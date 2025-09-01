import { IonButton, IonContent, IonInput, IonPage, IonRouterLink, IonText } from "@ionic/react";
import { useHistory, useLocation } from "react-router-dom";
import useFormInput from "../../Hooks/useFormInput";
import { formatTime, validateOtp } from "../../utils/utils";
import { useEffect, useState } from "react";
import { verifyOtpAPI } from "./loginAPi";

interface RouteParams {
    phone: string;
}

const OtpVerificationPage = () => {
    const location = useLocation<RouteParams>();
    const history = useHistory();
    const phone = location.state?.phone || "";
    const otp = useFormInput("", validateOtp);
    const [timeLeft, setTimeLeft] = useState(150);
    const [isLoading, setIsLoading] = useState(false);

    const resendOtp = () => {
        console.log("implement this !!");
    };

    const verifyOtp = async () => {
        try {
            setIsLoading(true);
            const response = await verifyOtpAPI(otp.value);
            if (response.OK) {
                history.push("/register",)
            } else {
                // write invalid logic
            }
        } catch {
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft]);

    return (
        <IonPage>
            <IonContent className="ion-padding">
                <div className="flex flex-col items-center justify-center h-full">
                    <div className="max-w-md w-full space-y-6">
                        <div className="text-center ">
                            <h1 className="text-2xl font-bold">Verification Code</h1>
                            <p className="text-gray-500 mt-2">Enter the security code we sent to</p>
                        </div>
                        <div className="tracking-[.2rem] text-center">{phone}</div>
                        <IonInput
                            className={`${otp.isValid === false && "ion-invalid"} ${otp.touched && "ion-touched"}`}
                            label="Enter OTP"
                            placeholder="12356"
                            labelPlacement="floating"
                            inputmode="numeric"
                            maxlength={6}
                            {...otp.bind}
                        />
                        <IonButton expand="full" onClick={verifyOtp}>
                            VERIFY
                        </IonButton>
                        {/* resend otp */}
                        <div className="flex flex-col items-center gap-1 text-xs">
                            <div className="">Didn't recevie code?</div>
                            <div className="flex items-center">
                                <IonButton
                                    fill="clear"
                                    size="small"
                                    type="button"
                                    color={"primary"}
                                    onClick={resendOtp}
                                    disabled={timeLeft > 0}
                                >
                                    Resend
                                </IonButton>
                                {timeLeft > 0 && <IonText> - {formatTime(timeLeft)}</IonText>}
                            </div>
                        </div>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default OtpVerificationPage;
