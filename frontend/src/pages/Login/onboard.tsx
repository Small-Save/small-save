import React from "react";
import { useHistory } from "react-router-dom";
import { IonContent, IonButton } from "@ionic/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import smartallocation from "../../assets/images/smartallocation.svg";
import secure from "../../assets/images/secure.svg"
import  groupsaving from "../../assets/images/groupsavings.svg"


const OnBaord : React.FC = () => {

    return (
        <IonContent fullscreen>
        <Swiper
        modules={[Pagination]}
        pagination ={{clickable:true}}
        className="h-full">

            <SwiperSlide>
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    {/* <h2>Group Savings</h2> */}
                    <p>Create or join Savings Groups with family and friends. Set collective financial goals.</p>   
                    <img src={groupsaving}  className="w-90" />  
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    {/* <h2>Smart Allocation</h2> */}
                    <p>Fair distribution system with randomization or bidding methods for payouts.</p>  
                    <img src={smartallocation}  className="w-90" />
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    {/* <h2>Secure & Transparent</h2> */}
                    <p>Track Contributions, view group progress and manage your savings securely.</p>   
                    <img src={secure} className="w-90" />  
                </div>
            </SwiperSlide>
        </Swiper>
        </IonContent>
    )

}


export default OnBaord;
