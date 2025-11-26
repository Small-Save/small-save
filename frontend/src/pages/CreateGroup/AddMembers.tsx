import { IonPage, IonButton, IonIcon, IonContent, IonSearchbar, IonFooter } from "@ionic/react";
import { checkmarkDoneSharp, arrowRedoOutline, personAddOutline } from "ionicons/icons";
import { useIonRouter } from "@ionic/react";
import { fetchDeviceContacts } from "lib/utils";
import React, { useEffect, useState, useMemo, useCallback, useDeferredValue } from "react";
import { verifyContacts, createGroup } from "../../services/groupservice";;
import { useGroupCreation } from "contexts/GroupCreationContext";
import { HeaderBox } from "components/HeaderBox";
import "./AddMembers.css";
import type { User, Contact } from "types";
import profileImageTemp from "assets/images/profileImageTemp.jpg";

type MemberMode = "existing" | "invite";
interface AddUserComponentProps {
    id: string;
    username: string;
    isSelected: boolean;
    mode: MemberMode;
    onSelect: (id: string) => void;
}

const AddUserComponent: React.FC<AddUserComponentProps> = ({ id, username, isSelected, mode, onSelect }) => {
    const { icon, text, className, fill } = useMemo(() => {
        if (mode === "invite") return { icon: arrowRedoOutline, text: "Invite", className: "", fill: "solid" } as const;
        if (isSelected)
            return { icon: checkmarkDoneSharp, text: "Added", className: "selected", fill: "outline" } as const;
        return { icon: personAddOutline, text: "Add", className: "", fill: "solid" } as const;
    }, [mode, isSelected]);

    return (
        <div className="flex items-center justify-between px-4 py-3 border border-gray-200 last:border-b-0 hover:bg-gray-50">
            <div className="flex gap-3">
                {/* src = {contact.pic ?? profileImageTemp} */}
                <img src={profileImageTemp} alt={`${username || "User"} avatar`} className="w-10 h-10 rounded-3xl" />
                <div className="flex items-center gap-3">
                    <span className="text-base font-semibold text-gray-800">{username}</span>
                </div>
            </div>
            <IonButton
                aria-label={`${text} ${username}`}
                onClick={() => onSelect(id)}
                size="small"
                className={`invite-btn ${className}`}
                fill={fill}
            >
                <span className="btn-content">
                    <IonIcon icon={icon} />
                    <span>{text}</span>
                </span>
            </IonButton>
        </div>
    );
};

const AddMembers: React.FC = () => {
    const ionRouter = useIonRouter();
    const { groupInfo, reset } = useGroupCreation();

    const [existingUsers, setExistingUsers] = useState<User[]>([]);
    const [inviteNeeded, setInviteNeeded] = useState<Contact[]>([]);
    const [searchText, setSearchText] = useState("");
    const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!groupInfo) ionRouter.push("/group/new", "back");
    }, [groupInfo, ionRouter]);

    const handleFetchContacts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const contacts = await fetchDeviceContacts();
            if (contacts) {
                const response = await verifyContacts(contacts);
                if (response?.data) {
                    setExistingUsers(response.data.existing_users ?? []);
                    setInviteNeeded(response.data.invite_needed ?? []);
                }
            }
        } catch (err: any) {
            console.error(err);
            setError("Failed to load contacts");
        } finally {
            setLoading(false);
        }
    }, []);

    const handleCreateGroup = useCallback(async () => {
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
            await createGroup(payload);
            // TODO: Navigate to success page or group details
        } catch (error) {
            console.error("Error creating group:", error);
        } finally {
            reset();
        }
    }, [groupInfo, ionRouter, selectedMembers, reset]);

    const handleInvite = useCallback((id: string) => {
        // TODO: Implement invite flow (SMS / push / deep link)
        console.log("Invite requested for", id);
    }, []);

    useEffect(() => {
        handleFetchContacts();
    }, [handleFetchContacts]);

    const toggleMember = useCallback((id: string) => {
        setSelectedMembers((prev) => {
            const copy = new Set(prev);
            copy.has(id) ? copy.delete(id) : copy.add(id);
            return copy;
        });
    }, []);

    const deferredSearch = useDeferredValue(searchText.trim().toLowerCase());
    const filteredExistingUsers = useMemo(
        () => existingUsers.filter((u) => u.username?.toLowerCase().includes(deferredSearch)),
        [existingUsers, deferredSearch]
    );
    const filteredInviteNeeded = useMemo(
        () => inviteNeeded.filter((c) => c.username?.toLowerCase().includes(deferredSearch)),
        [inviteNeeded, deferredSearch]
    );

    const deriveId = useCallback((entity: { id?: string; phone_number?: string }, fallback: string) => {
        return entity.id ?? entity.phone_number ?? fallback;
    }, []);

    return (
        <IonPage>
            {/* Header */}
            <HeaderBox title="Create New Group" subTitle="Add Group Memebers" />

            <IonContent fullscreen className="ion-padding">
                <div className="px-3 ">
                    {/* Section Title */}
                    <div className="mb-3">
                        <span className="text-lg font-bold">Add Members</span>
                        <p className="text-xs text-gray-500">Invite friends to join your savings group</p>
                    </div>

                    <div className="flex flex-col rounded-2xl shadow-lg p-1 max-h-150 overflow-y-auto">
                    {/* Search Bar */}
                        <IonSearchbar
                            value={searchText}
                            onIonInput={(e) => setSearchText(e.detail.value!)}
                            placeholder="Search Contacts"
                            className="search-bar"
                            inputMode="search"
                        />
                        {/* list of selected users with their image */}
                        {selectedMembers.size > 0 && (
                            <div className="selected-strip" aria-label="Selected members">
                                {existingUsers.filter(c => selectedMembers.has(c.id)).map(c => (
                                    <div key={c.id} className="selected-item">
                                        <img
                                            src={profileImageTemp}
                                            alt={`${c.username || "User"} avatar`}
                                            className="selected-img"
                                        />
                                        <button
                                            type="button"
                                            aria-label={`Remove ${c.username}`}
                                            onClick={() => toggleMember(c.id)}
                                            className="remove-selected"
                                        >
                                            x
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Contacts List Container */}
                        <div className="bg-white rounded-2xl max-h-200 overflow-hidden">
                            <div
                                className="px-4 py-2 flex items-center justify-between text-xs text-gray-600"
                                aria-live="polite"
                            >
                                <span> Contacts on SmallSave</span>
                                <span>
                                    Selected: {selectedMembers.size}/{groupInfo?.groupSize ?? "-"}
                                </span>
                                {loading && <span>Loading contacts...</span>}
                                {!loading && error && <span className="text-red-600">{error}</span>}
                            </div>
                            <div className="h-full overflow-y-auto">
                                {/* Existing Users */}
                                {filteredExistingUsers.map((contact, idx) => {
                                    const id = deriveId(contact, `existing-${idx}`);
                                    const isSelected = selectedMembers.has(id);
                                    return (
                                        <AddUserComponent
                                            key={id}
                                            id={id}
                                            username={contact.username || "Unknown"}
                                            isSelected={isSelected}
                                            mode="existing"
                                            onSelect={toggleMember}
                                        />
                                    );
                                })}

                                {/* Invite Needed Users */}
                                {filteredInviteNeeded.map((contact, idx) => {
                                    const id = deriveId(contact, `invite-${idx}`);
                                    const isSelected = selectedMembers.has(id);
                                    return (
                                        <AddUserComponent
                                            key={id}
                                            id={id}
                                            username={contact.username || contact.phone_number || "Contact"}
                                            isSelected={isSelected}
                                            mode="invite"
                                            onSelect={handleInvite}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Create Group Button */}
                <IonFooter>
                    <IonButton
                        expand="block"
                        className="mt-4"
                        color="dark"
                        disabled={!groupInfo || selectedMembers.size !== groupInfo.groupSize || loading}
                        onClick={handleCreateGroup}
                    >
                        {loading ? "Processing..." : "Create Group"}
                    </IonButton>
                </IonFooter>
            </IonContent>
        </IonPage>
    );
};

export default AddMembers;
