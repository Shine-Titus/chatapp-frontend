import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useConversations } from "../context/ConversationsContext";
import { useToggleSet } from "../hooks/useToggleSet";
import { useUsers } from "../hooks/useUsers";
import UserCheckList from "../components/UserCheckList";

export default function NewGroupPage() {
  const navigate = useNavigate();
  const { createGroup } = useConversations();
  const users = useUsers();

  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [groupMembers, toggleMember] = useToggleSet();
  const [groupError, setGroupError] = useState("");

  const submit = async () => {
    setGroupError("");

    if (!groupName.trim()) return setGroupError("Enter a group name");
    if (groupMembers.size < 1) return setGroupError("Pick at least one member");

    const { group, error } = await createGroup({
      name: groupName.trim(),
      description: groupDesc.trim(),
      participantIds: [...groupMembers],
    });

    if (error) return setGroupError(error);
    if (group) navigate(`/chats/${group.id}`);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>New group</h1>
        <button className="switch-button" onClick={() => navigate("/")}>Back</button>
      </div>

      <div className="group-form">
        {groupError && <p className="login-error">{groupError}</p>}

        <input
          placeholder="Group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        <input
          placeholder="Group description"
          value={groupDesc}
          onChange={(e) => setGroupDesc(e.target.value)}
        />

        <p className="group-hint">Select members ({groupMembers.size})</p>

        <UserCheckList users={users} selected={groupMembers} onToggle={toggleMember} />

        <button className="create-group-button" onClick={submit}>
          Create group
        </button>
      </div>
    </div>
  );
}
