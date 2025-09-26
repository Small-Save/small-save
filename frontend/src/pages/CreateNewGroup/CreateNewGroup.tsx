import React from "react";
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonContent,
    IonInput,
    IonItem,
    IonLabel,
    IonIcon
} from "@ionic/react";
import { arrowBack, calendarOutline, peopleOutline, timeOutline } from "ionicons/icons";
import { useHistory } from "react-router";
import useFormInput from "../../Hooks/useFormInput";
import { validateDuration, validateGroupSize, validateTargetAmount } from "../../utils/utils";

const CreateGroup: React.FC = () => {
    const history = useHistory();
    const winnerMethod = useFormInput<"random" | "bidding">("random");

    const nameOfTheGroup = useFormInput("");
    const targetAmount = useFormInput("", validateTargetAmount);
    const duration = useFormInput("", validateDuration);
    const groupSize = useFormInput("", validateGroupSize);
    // const startDate = useFormInput("");

    return (
        <IonPage>
            {/* Header */}
            <IonHeader>
                <IonToolbar color="dark">
                    <IonButtons slot="start">
                        <IonButton onClick={() => history.goBack()}>
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
            <IonContent className="ion-padding" scrollY={false}>
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
                                {...nameOfTheGroup.bind}
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
                                label={`Duration (months) ` }
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
                            <IonButton />
                            <IonButton />
                        </div>

                        {/* Fix styling and inputs */}
                        {/* <IonRadioGroup {...winnerMethod.bind} onIonChange={(e) => winnerMethod.setValue(e.detail.value)}>
                                <IonItem>
                                    <IonLabel>Randomization</IonLabel>
                                    <IonRadio slot="start" value="random" />
                                </IonItem>
                                <IonItem>
                                    <IonLabel>Bidding</IonLabel>
                                    <IonRadio slot="start" value="bidding" />
                                </IonItem>
                            </IonRadioGroup> */}
                        {/* <IonButton
                                expand="block"
                                style={{
                                    flex: 1,
                                    backgroundColor: winnerMethod.value === "bidding" ? "green" : "gray"
                                }}
                                {...winnerMethod.bind}
                            >
                                Bidding
                            </IonButton> */}

                        {/* Start Date */}
                        {/* <IonItem lines="full" className="ion-margin-top">
                        <IonLabel position="stacked">Start Date</IonLabel>
                        <IonDatetime presentation="date" showDefaultButtons>
                        <IonIcon icon={calendarOutline} slot="end" />
                        </IonDatetime>
                        </IonItem> */}

                        <IonInput type="text" placeholder="Pick a date" />
                        {/* Submit Button */}
                        <IonButton expand="block" className="ion-margin-top" color="dark">
                            Next : Add Members
                        </IonButton>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default CreateGroup;
