import { IonPage, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent, IonSearchbar } from "@ionic/react";
import { arrowBack, addOutline, shareSocialOutline } from "ionicons/icons";
import { useIonRouter } from "@ionic/react";
import { fetchDeviceContacts } from "lib/utils";
import { useEffect, useState } from "react";
import { verifyContacts, createGroup } from "./services";
import { useGroupCreation } from "contexts/GroupCreationContext";

const AddMembers: React.FC = () => {
    const ionRouter = useIonRouter();
    const { groupInfo, reset } = useGroupCreation();

    const [existingUsers, setExistingUsers] = useState<User[]>([]);
    const [inviteNeeded, setInviteNeeded] = useState<Contact[]>([]);
    const [searchText, setSearchText] = useState("");
    const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!groupInfo) {
            console.error("No group details available");
            // Navigate back to create group page
            ionRouter.push("/group/new", "back");
            return;
        }
    });

    const handleFetchContacts = async () => {
        try {
            const contacts = await fetchDeviceContacts();
            if (contacts !== undefined) {
                const response = await verifyContacts(contacts);
                if (response?.data) {
                    setExistingUsers(response.data.existing_users);
                    setInviteNeeded(response.data.invite_needed);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateGroup = async () => {
        if (!groupInfo) {
            console.error("No group groupInfo available");
            // Navigate back to create group page
            ionRouter.push("/group/new", "back");
            return;
        }
        if (selectedMembers.size !== groupInfo.groupSize) {
            // TODO show some error
            return;
        }

        const payload = {
            name: groupInfo.groupName,
            target_amount: groupInfo.targetAmount,
            duration: groupInfo.duration,
            size: groupInfo.groupSize,
            winner_selection_method: groupInfo.winnerMethod,
            member_ids: Array.from(selectedMembers),
            start_date: groupInfo.startDate
        };

        try {
            const response = await createGroup(payload);

            // TODO: Navigate to success page or group details
        } catch (error) {
            console.error("Error creating group:", error);
        } finally {
            reset();
        }
    };

    useEffect(() => {
        handleFetchContacts();
    }, []);

    const toggleMember = (id: string) => {
        const newSelected = new Set(selectedMembers);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedMembers(newSelected);
    };

    const filteredExistingUsers = existingUsers.filter((user) =>
        user.username?.toLowerCase().includes(searchText.toLowerCase())
    );

    const filteredInviteNeeded = inviteNeeded.filter((contact) =>
        contact.name?.toLowerCase().includes(searchText.toLowerCase())
    );

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
                        <p className="text-sm">Add Group Members</p>
                    </div>
                </IonToolbar>
            </IonHeader>

            <IonContent className="bg-gray-50">
                <div className="px-4 py-6">
                    {/* Section Title */}
                    <div className="mb-3">
                        <h2 className="text-xl font-bold text-gray-800 mb-1">Add Members</h2>
                        <p className="text-sm text-gray-500">Invite friends to join your savings group</p>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-4">
                        <IonSearchbar
                            value={searchText}
                            onIonInput={(e) => setSearchText(e.detail.value!)}
                            placeholder="Search Contacts"
                            className="custom-searchbar p-0"
                        />
                    </div>
                    {/* TODO: Add a list of added members section  */}

                    {/* Contacts List Container */}
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <div className="max-h-[400px] overflow-y-auto">
                            {/* Existing Users */}
                            {filteredExistingUsers.map((contact, idx) => (
                                <div
                                    key={contact.id ?? contact.phone_number ?? `existing-${idx}`}
                                    className="flex items-center justify-between px-4 py-3 border-b border-gray-100 hover:bg-gray-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-base font-semibold text-gray-800">
                                            {contact.username}
                                        </span>
                                    </div>
                                    <IonButton
                                        // TODO: May need to change this to take ID
                                        onClick={() => toggleMember(contact.id)}
                                        size="small"
                                        className={`invite-btn ${
                                            selectedMembers.has(contact.id)
                                                ? "bg-green-600 text-white": ""
                                        }`}

                                    >
                                        <IonIcon icon={addOutline} className="text-lg" />
                                        {selectedMembers.has(contact.id) ? "Added" : "Add"}
                                    </IonButton>
                                </div>
                            ))}

                            {/* Invite Needed Users */}
                            {filteredInviteNeeded.map((contact, idx) => (
                                <div
                                    key={contact.phone_number ?? `invite-${idx}`}
                                    className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-base font-semibold text-gray-800">{contact.name}</span>
                                    </div>
                                    <IonButton size="small" className="invite-btn" >
                                        <IonIcon icon={shareSocialOutline} className="text-lg" />
                                        Invite
                                    </IonButton>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Create Group Button */}

                <IonButton
                    expand="block"
                    className="ion-margin-top"
                    color="dark"
                    disabled={selectedMembers.size !== groupInfo?.groupSize}
                    onClick={handleCreateGroup}
                >
                    Create Group
                </IonButton>
            </IonContent>
        </IonPage>
    );
};

export default AddMembers;
