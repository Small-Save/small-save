import React from "react";
import { IonContent, IonButton } from "@ionic/react";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import { Pagination } from "swiper/modules";
import smartallocation from "../../assets/images/smartallocation.svg";
import secure from "../../assets/images/secure.svg";
import groupsaving from "../../assets/images/groupsavings.svg";

const OnBoard: React.FC = () => {

    // Helper component for a slide with a Next button
    const SlideWithNextButton: React.FC<{ imgSrc: string; text: string }> = ({ imgSrc, text }) => {
        const swiper = useSwiper();

        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <p style={{ lineHeight: '1.8' }}>{text}</p>
                <img src={imgSrc} className="w-100 h-100" />
                 <IonButton className="w-full flex justify-end mt-4"
                    color="primary"
                    onClick={() => swiper.slideNext()}
                >
                    Next
                </IonButton>
            </div>
        );
    };

    return (
        <IonContent fullscreen>
            <Swiper
                modules={[Pagination]}
                pagination={{ clickable: true }}
                className="h-full"
            >
                <SwiperSlide>
                    <SlideWithNextButton
                        imgSrc={groupsaving}
                        text="Create or join Savings Groups with family and friends. Set collective financial goals."
                    />
                </SwiperSlide>

                <SwiperSlide>
                    <SlideWithNextButton
                        imgSrc={smartallocation}
                        text="Fair distribution system with randomization or bidding methods for payouts."
                    />
                </SwiperSlide>

                <SwiperSlide>
                    <SlideWithNextButton
                        imgSrc={secure}
                        text="Track Contributions, view group progress and manage your savings securely."
                    />
                </SwiperSlide>
            </Swiper>
        </IonContent>
    );
};

export default OnBoard;
