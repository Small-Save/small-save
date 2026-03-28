import React, { useContext, useEffect, useState } from "react";

import { IonButton, IonContent, IonInput, IonPage, IonText } from "@ionic/react";
import { useHistory, useLocation } from "react-router-dom";

import { AuthContext } from "contexts/AuthProvider";
import useFormInput from "Hooks/useFormInput";
import { formatTime, validateOtp } from "lib/utils";

interface RouteParams {
    phone: string;
}

const OtpVerificationPage: React.FC = () => {
    const location = useLocation<RouteParams>();
    const history = useHistory();
    const { verifyOtp, user } = useContext(AuthContext)!;

    const phone = location.state?.phone || "";
    const otp = useFormInput("", validateOtp, (v: string) => v.replace(/[^0-9]/g, ""));
    const [timeLeft, setTimeLeft] = useState(150);
    const [isLoading, setIsLoading] = useState(false);

    const resendOtp = () => {
        // TODO: sendOtp function
        console.log("implement this !!");
        setTimeLeft(150);
    };

    const handleVerifyOtp = async () => {
        if (!otp.isValid) return; // TODO: maybe show toast here

        const numericOtp = Number(otp.value);
        if (Number.isNaN(numericOtp)) return; // guard: invalid numeric value

        try {
            setIsLoading(true);
            const response = await verifyOtp(phone, numericOtp);
            if (response) {
                if (!response.data?.user.is_registered) {
                    history.push("/register", { phone });
                } else {
                    history.push("/home");
                }
            }
        } finally {
            otp.setValue("");
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (timeLeft <= 0) return;
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
                            className={`${otp.isError ? "ion-invalid" : ""} ${otp.touched ? "ion-touched" : ""}`}
                            label="Enter OTP"
                            placeholder="123456"
                            labelPlacement="floating"
                            type="tel"
                            inputMode="numeric"
                            maxlength={6}
                            {...otp.bind}
                        />
                        <IonButton expand="full" onClick={handleVerifyOtp} disabled={!otp.isValid || isLoading}>
                            {isLoading ? "VERIFYING..." : "VERIFY"}
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
