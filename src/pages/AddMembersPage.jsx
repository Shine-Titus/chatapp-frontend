import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useMembers } from "../hooks/useMembers";
import { useToggleSet } from "../hooks/useToggleSet";
import { useUsers } from "../hooks/useUsers";
import UserCheckList from "../components/UserCheckList";

export default function AddMembersPage() {
  const { conversation } = useOutletContext();
  const navigate = useNavigate();
  const users = useUsers();
  const { members, loaded, addMembers } = useMembers(conversation.id);

  const [addSelection, toggleSelection] = useToggleSet();
  const [actionError, setActionError] = useState("");

  const backToMembers = () => navigate(`/chats/${conversation.id}/members`);

  // wait for the member list so people already in the group never flash up as candidates
  const candidates = loaded ? users.filter((u) => !members.some((m) => m.id === u.id)) : [];

  const submit = async () => {
    setActionError("");

    const error = await addMembers([...addSelection]);
    if (error) return setActionError(error);

    backToMembers();
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>Add to {conversation.name}</h1>
        <button className="switch-button" onClick={backToMembers}>Back</button>
      </div>

      <div className="group-form">
        {actionError && <p className="login-error">{actionError}</p>}

        <p className="group-hint">Select users ({addSelection.size})</p>

        <UserCheckList
          users={candidates}
          selected={addSelection}
          onToggle={toggleSelection}
          emptyText={loaded ? "Everyone is already in this group." : undefined}
        />

        <button className="create-group-button" onClick={submit}>
          Add selected
        </button>
      </div>
    </div>
  );
}
