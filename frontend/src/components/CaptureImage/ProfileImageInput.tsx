import React, { useRef, useState } from "react";
import { IonIcon } from "@ionic/react";
import { camera } from "ionicons/icons";
import "./ProfileImageInput.css";

const ProfileImageInput: React.FC = () => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-wrapper">
                <img src={preview || "/src/assets/images/profileImageTemp.jpg"} alt="Profile" className="profile-image" />
                <div className="camera-button" onClick={() => fileInputRef.current?.click()}>
                    <IonIcon icon={camera} />
                </div>
            </div>

            {/* Hidden file input */}
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageChange}
            />
        </div>
    );
};

export default ProfileImageInput;
