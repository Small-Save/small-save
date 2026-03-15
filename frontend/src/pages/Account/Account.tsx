import React from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle,
  IonContent,
} from "@ionic/react";
import {
  arrowBackOutline,
  settingsOutline,
  pencil,
  mail,
  call,
  person,
  notifications,
  card,
  lockClosed,
  helpCircle,
  chevronForwardOutline,
  logOutOutline,
} from "ionicons/icons";
import { useHistory } from "react-router";

// Make sure to add a placeholder or actual image in your assets
import profileAvatar from "assets/images/profileImageTemp.jpg"; 
import "./Account.css";

const Account: React.FC = () => {
  const history = useHistory();

  const managementLinks = [
    {
      id: "personal",
      title: "Personal Information",
      subtitle: "Update your identity and KYC data",
      icon: person,
    },
    {
      id: "notifications",
      title: "Notification Preferences",
      subtitle: "Manage alerts and newsletters",
      icon: notifications,
    },
    {
      id: "payment",
      title: "Payment Methods",
      subtitle: "Linked banks and cards",
      icon: card,
    },
    {
      id: "security",
      title: "Security & Privacy",
      subtitle: "Password, 2FA, and permissions",
      icon: lockClosed,
    },
    {
      id: "support",
      title: "Help & Support",
      subtitle: "FAQs and contact our advisors",
      icon: helpCircle,
    },
  ];

  return (
    <IonPage className="account-page">
      <IonHeader className="ion-no-border">
        <IonToolbar className="account-header">
          <IonButtons slot="start">
            <IonButton onClick={() => history.goBack()}>
              <IonIcon icon={arrowBackOutline} className="header-icon" />
            </IonButton>
          </IonButtons>
          <IonTitle className="account-title">Account</IonTitle>
          <IonButtons slot="end">
            <IonButton>
              <IonIcon icon={settingsOutline} className="header-icon" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="account-content">
        <div className="account-container">
          
          {/* Profile Card Section */}
          <div className="profile-card">
            <div className="avatar-container">
              <img src={profileAvatar} alt="Profile" className="avatar-img" />
              <div className="edit-badge">
                <IonIcon icon={pencil} className="edit-icon" />
              </div>
            </div>

            <p className="user-role">SCHOLAR GUARDIAN</p>
            <h1 className="user-name">Amit Kumar</h1>
            
            <div className="contact-info">
              <div className="contact-item">
                <IonIcon icon={mail} className="contact-icon" />
                <span>amit.kumar@university.edu</span>
              </div>
              <div className="contact-item">
                <IonIcon icon={call} className="contact-icon" />
                <span>+1 (555) 982-0144</span>
              </div>
            </div>
          </div>

          {/* Management Section Header */}
          <div className="section-header">
            <h2>Management</h2>
            <span className="settings-label">SETTINGS</span>
          </div>

          {/* Management Links List */}
          <div className="management-list-card">
            {managementLinks.map((link, index) => (
              <div className="management-item" key={link.id}>
                <div className="item-left">
                  <div className="item-icon-wrapper">
                    <IonIcon icon={link.icon} className="item-icon" />
                  </div>
                  <div className="item-text">
                    <h3>{link.title}</h3>
                    <p>{link.subtitle}</p>
                  </div>
                </div>
                <IonIcon icon={chevronForwardOutline} className="chevron-icon" />
              </div>
            ))}
          </div>

          {/* Logout Button */}
          <button className="logout-btn">
            <IonIcon icon={logOutOutline} className="logout-icon" />
            Logout
          </button>

          {/* App Version */}
          <p className="app-version">APP VERSION 2.4.0 (ACADEMIC EDITION)</p>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Account;