import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { IonContent, IonButton, IonIcon } from "@ionic/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { arrowForward, home } from "ionicons/icons";
import smartallocation from "../../assets/images/smartallocation.svg";
import { addIcons } from 'ionicons';
import secure from "../../assets/images/secure.svg";
import groupsaving from "../../assets/images/groupsavings.svg";

const OnBoard: React.FC = () => {
    const history = useHistory();
    const [activeIndex, setActiveIndex] = useState(0);
    const [swiperInstance, setSwiperInstance] = useState<any>(null);
    const totalSlides = 3;

    const SlideWithNextButton: React.FC<{ imgSrc: string; text: string }> = ({ imgSrc, text }) => {
        const isLastSlide = activeIndex === totalSlides - 1;

        const handleNext = () => {
            if (isLastSlide) {
                history.push('/home');
            } else if (swiperInstance) {
                swiperInstance.slideNext();
            }
        };

        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4 relative">
                <p style={{ lineHeight: '1.8' }}>{text}</p>

                <div className="relative w-full flex justify-center mt-30">
                    <img src={imgSrc} className="w-100 h-100 object-contain" />

                    <IonButton
                        color="primary"
                        className="absolute bottom-4 right-4"
                        shape="round"
                        onClick={handleNext}>
                         <IonIcon slot="icon-only" icon={isLastSlide ? home : arrowForward}></IonIcon>
                    </IonButton>
                </div>
            </div>
        );
    };

    return (
        <IonContent fullscreen>
            <Swiper
                modules={[Pagination]}
                pagination={{ clickable: true }}
                className="h-full"
                onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                onSwiper={(swiper) => setSwiperInstance(swiper)}
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
