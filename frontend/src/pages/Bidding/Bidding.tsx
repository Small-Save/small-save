import { IonButton, IonContent, IonIcon, IonInput, IonPage, IonProgressBar } from "@ionic/react";
import { HeaderBox } from "components/HeaderBox";
import { settingsOutline, timerOutline, chevronForwardOutline } from "ionicons/icons";
import React, { useEffect, useState } from "react";
import profileImageTemp from "assets/images/profileImageTemp.jpg";
import { Field } from "components/Field";
import useFormInput from "Hooks/useFormInput";
import { BiddingRound, fetchBiddingDetails } from "./services";

const Bidding: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState(0);
    const [lisftofBids, setlistOfBids] = useState([1, 2]);
    const bidAmount = useFormInput("");
    const [biddingDetails, setBiddingDetails] = useState<BiddingRound>()

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft((prevTime) => prevTime + 0.01);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    // TODO: Remove this later
    if (timeLeft > 1) {
        setTimeout(() => {
            setTimeLeft(0);
        }, 1000);
    }

    useEffect(() => {
        const fetchData = async () => {
            // TODO: chnage the param to bidding Round
            const response = await fetchBiddingDetails(1);
            setBiddingDetails(response.data?.bidding_round)
        };
        fetchData();
    }, [])

    return (
        <IonPage>
            <HeaderBox
                title={biddingDetails?.group_name ?? "Bidding"}
                subTitle={`{Round ${biddingDetails?.round_number} out of 10}`}
                actions={[
                    {
                        key: "settings",
                        element: (
                            <IonButton>
                                <IonIcon icon={settingsOutline} />
                            </IonButton>
                        ),
                        slot: "end"
                    }
                ]}
            />
            <IonContent className="ion-padding">
                {/* winner card */}
                <div className="bg-indigo-500 pt-2 pb-2 text-white mb-3 rounded-lg">
                    <span className="flex flex-col items-center-safe">
                        <p className="font-bold5">Current Round</p>
                        <p className="text-xs">{"{₹2000}"} pool</p>
                    </span>

                    {/* Winner Banner */}
                    <div className="flex flex-col items-center-safe">
                        <p className="font-bold">This round's Winner</p>
                        <p className="text-xs">{biddingDetails?.winner_username}</p>
                    </div>
                </div>
                <div className="flex flex-col space-y-3.5 shadow-lg">
                    <p>Bidding System</p>
                    <div className="flex flex-col gap-1 rounded-lg border-2 border-solid border-orange-800 bg-amber-300 p-1">
                        <p className="text-xs text-center">Time Until Winner Selection</p>
                        <p className="flex items-center gap-1 justify-end-safe text-xs">
                            <IonIcon icon={timerOutline} /> {"{0h 59m 42s}"}
                        </p>
                        <IonProgressBar value={timeLeft}></IonProgressBar>
                        <p className="text-xs text-center">Place your bid before time runs out!</p>
                    </div>

                    {/* Current Lowest Bidder */}
                    <div className="flex flex-col space-y-1 items-center p-1 rounded-lg border-2 border-solid border-green-600 bg-green-200 ">
                        <p>Current Highest Bid</p>
                        <p>{"{₹1995}"}</p>
                        <div classN ame="flex items-center gap-1">
                            <img src={profileImageTemp} width={30} height={30} className="rounded-xl" />
                            <span> {"{Kantha Bhai is leading!}"}</span>
                        </div>
                    </div>
                    {/* Place your Bid */}
                    <div className="flex p-1 ">
                        {/* <Field label="Place Your Bid" placeholder="Enter the bid amount here" hook={bidAmount} /> */}
                        <IonInput
                            type={"text"}
                            label={"Place Your Bid"}
                            labelPlacement="stacked"
                            placeholder={"Enter the bid amount here"}
                            className={`${bidAmount.isError && "ion-invalid"} ${bidAmount.touched && "ion-touched"}`}
                            aria-invalid={bidAmount.isError}
                            {...bidAmount.bind}
                        />
                        <IonButton>
                            <IonIcon icon={chevronForwardOutline} />
                        </IonButton>
                    </div>

                    {/* Leader board */}
                    <div className="space-y-2">
                        <p className="text-sm ">Live Bidding Leaderboard</p>
                        <div className="space-y-3">
                            {lisftofBids.map((value, idx) => {
                                return (
                                    <div className="flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={profileImageTemp}
                                                alt="User Avatar"
                                                className="h-10 w-10 rounded-full object-cover"
                                            />

                                            <div>
                                                <p className="text-sm font-semibold text-blue-700">Kantha Bhai</p>
                                                <p className="text-xs text-gray-500">#1 Loading</p>
                                            </div>
                                        </div>

                                        <div className="text-sm font-semibold text-gray-900">₹ 1,995</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Bidding;
