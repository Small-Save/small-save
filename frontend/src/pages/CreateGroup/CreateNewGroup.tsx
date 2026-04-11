import React, { useCallback, useMemo } from "react";

import {
    IonButton,
    IonContent,
    IonDatetime,
    IonDatetimeButton,
    IonLabel,
    IonModal,
    IonPage,
    useIonRouter
} from "@ionic/react";

import { Field } from "components/Field";
import { HeaderBox } from "components/HeaderBox";
import { GroupDetails, useGroupCreation } from "contexts/GroupCreationContext";
import useFormInput from "Hooks/useFormInput";
import { validateDuration, validateGroupSize, validateTargetAmount } from "lib/utils";

type WinnerMethod = GroupDetails["winnerMethod"];

const CreateGroup: React.FC = () => {
    const ionRouter = useIonRouter();
    const { setDetails } = useGroupCreation();

    const winnerMethod = useFormInput<WinnerMethod>("random");

    const groupName = useFormInput("", (name) => {
        if (!name || name.trim().length === 0) {
            return { isValid: false, errorText: "Group name cannot be empty" };
        }
        if (name.trim().length < 3) {
            return { isValid: false, errorText: "Minimum 3 characters" };
        }
        return { isValid: true };
    });
    const duration = useFormInput("", validateDuration);
    const groupSize = useFormInput("", validateGroupSize);
    const targetAmount = useFormInput("", (v) => validateTargetAmount(v, groupSize.value));
    // Compute a min allowed date (tomorrow) once
    const tomorrow = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d;
    }, []);
    const startDateIso = tomorrow.toISOString();
    const startDate = useFormInput(startDateIso.split("T")[0]);

    // Aggregate validation state for enabling button
    const isFormValid = useMemo(
        () => groupName.isValid && targetAmount.isValid && groupSize.isValid && duration.isValid,
        [groupName.isValid, targetAmount.isValid, groupSize.isValid, duration.isValid]
    );

    const handleAddMembers = useCallback(() => {
        if (!isFormValid) return; // guard
        const details: GroupDetails = {
            groupName: groupName.value.trim(),
            targetAmount: Number(targetAmount.value),
            duration: Number(duration.value),
            groupSize: Number(groupSize.value),
            winnerMethod: winnerMethod.value,
            startDate: startDate.value ? new Date(startDate.value).toISOString() : undefined
        };
        setDetails(details);
        ionRouter.push("/group/new/members", "forward");
    }, [
        isFormValid,
        groupName.value,
        targetAmount.value,
        duration.value,
        groupSize.value,
        winnerMethod.value,
        startDate.value,
        setDetails,
        ionRouter
    ]);

    return (
        <IonPage>
            {/* Header */}

            <HeaderBox title="Create New Group" subTitle="Setup your savings group" />
            {/* Content */}
            <IonContent>
                <div>
                    <p className="text-xs text-gray-500 text-center mt-3">
                        Fill in the details below to create your savings group
                    </p>
                    <div className="flex flex-col gap-2  pt-4 h-full">
                        <Field label="Name Of The Group" placeholder="e.g. Sharmila" hook={groupName} />
                        <Field label="Group Size" placeholder="e.g. 8" type="number" hook={groupSize} />
                        <Field label="Target Amount (₹)" placeholder="e.g. 10,000" type="number" hook={targetAmount} />
                        <Field label="Duration (months)" placeholder="e.g. 12" type="number" hook={duration} />

                        {/* Winner Selection */}
                        <IonLabel className="ion-margin-top">Winner Selection Method</IonLabel>
                        <div className="flex flex-col gap-2" role="radiogroup" aria-label="Winner Selection Method">
                            {[
                                { label: "Randomization", value: "random" as WinnerMethod },
                                { label: "Bidding", value: "bidding" as WinnerMethod }
                            ].map((option) => (
                                <IonButton
                                    key={option.value}
                                    onClick={() => winnerMethod.setValue(option.value)}
                                    color={winnerMethod.value === option.value ? "success" : "medium"}
                                    aria-pressed={winnerMethod.value === option.value}
                                >
                                    {option.label}
                                </IonButton>
                            ))}
                        </div>
                        <IonLabel> Pick a Date</IonLabel>
                        <IonDatetimeButton datetime="datetime" />
                        <IonModal keepContentsMounted={true}>
                            <IonDatetime
                                id="datetime"
                                presentation="date"
                                min={startDateIso}
                                value={startDate.value}
                                onIonChange={(e) => startDate.setValue((e.detail.value as string) ?? "")}
                            ></IonDatetime>
                        </IonModal>
                        {/* Submit Button */}
                        <IonButton
                            expand="block"
                            className="mt-4"
                            color="dark"
                            disabled={!isFormValid}
                            onClick={handleAddMembers}
                        >
                            Next: Add Members
                        </IonButton>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default CreateGroup;
