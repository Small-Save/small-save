import React from "react";
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonContent,
    IonInput,
    IonLabel,
    IonIcon
} from "@ionic/react";
import { arrowBack } from "ionicons/icons";
import { useIonRouter } from "@ionic/react";
import useFormInput from "Hooks/useFormInput";
import { validateDuration, validateGroupSize, validateTargetAmount } from "lib/utils";
import { useGroupCreation } from "contexts/GroupCreationContext";

const CreateGroup: React.FC = () => {
    const ionRouter = useIonRouter();
    const { setDetails } = useGroupCreation();

    const winnerMethod = useFormInput<"random" | "bidding">("random");

    const groupName = useFormInput("");
    const targetAmount = useFormInput("", validateTargetAmount);
    const duration = useFormInput("", validateDuration);
    const groupSize = useFormInput("", validateGroupSize);
    const startDate = useFormInput("2025-11-01T00:00:00.000Z");

    const handleAddMembers = () => {
        const groupDetails = {
            groupName: groupName.value,
            targetAmount: Number(targetAmount.value),
            duration: Number(duration.value),
            groupSize: Number(groupSize.value),
            winnerMethod: winnerMethod.value,
            startDate: startDate.value ? new Date(startDate.value).toISOString() : startDate.value
        };
        setDetails(groupDetails);
        ionRouter.push("/group/new/members", "forward");
    };

    return (
        <IonPage>
            {/* Header */}
            <IonHeader>
                <IonToolbar color="dark">
                    <IonButtons slot="start">
                        <IonButton onClick={() => ionRouter.goBack()}>
                            <IonIcon icon={arrowBack} />
                        </IonButton>
                    </IonButtons>
                    <div className="flex flex-col items-center">
                        <p className="text-lg">Create New Group</p>
                        <p className="text-sm">Set up your savings group</p>
                    </div>
                </IonToolbar>
            </IonHeader>

            {/* Content */}
            <IonContent className="ion-padding">
                <div className="h-full">
                    <p className="text-sm text-gray-500 text-center">
                        Fill in the details below to create your savings group
                    </p>

                    <div className="flex flex-col gap-2  pt-4 h-full">
                        {/* Group Name */}
                        <IonInput
                            className="custom"
                            placeholder="e.g. Sharmila"
                            label="Name Of The Group"
                            labelPlacement="stacked"
                            {...groupName.bind}
                        />

                        {/* Target Amount */}
                        <IonInput
                            type="number"
                            className="custom"
                            label="Target Amount ($)"
                            labelPlacement="stacked"
                            placeholder="e.g. 10,000"
                            {...targetAmount.bind}
                        />

                        {/* Duration */}
                        <IonInput
                            type="number"
                            className="custom"
                            label={`Duration (months) `}
                            labelPlacement="stacked"
                            placeholder="e.g. 12"
                            {...duration.bind}
                        />

                        {/* Group Size */}
                        <IonInput
                            type="number"
                            className="custom"
                            label="Group Size"
                            labelPlacement="stacked"
                            placeholder="e.g. 8"
                            {...groupSize.bind}
                        />

                        {/* Winner Selection */}
                        <IonLabel className="ion-margin-top">Winner Selection Method</IonLabel>
                        <div className="flex flex-col gap-2">
                            <IonButton
                                onClick={() => {
                                    winnerMethod.setValue("random");
                                }}
                                color={winnerMethod.value === "random" ? "success" : ""}
                            >
                                Randomization
                            </IonButton>
                            <IonButton
                                onClick={() => {
                                    winnerMethod.setValue("bidding");
                                }}
                                color={winnerMethod.value === "bidding" ? "success" : ""}
                            >
                                Bidding
                            </IonButton>
                        </div>

                        <IonInput
                            type="datetime-local"
                            className="custom"
                            label="Start Date"
                            labelPlacement="stacked"
                            placeholder="Pick a date"
                            {...startDate.bind}
                        />
                        {/* Submit Button */}
                        <IonButton
                            expand="block"
                            className="ion-margin-top"
                            color="dark"
                            disabled={
                                !groupSize.isValid || !targetAmount.isValid || !groupName.isValid || !duration.isValid
                            }
                            onClick={handleAddMembers}
                        >
                            Next : Add Members
                        </IonButton>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default CreateGroup;
