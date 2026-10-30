import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePresence } from "../context/PresenceContext";
import { useMembers } from "../hooks/useMembers";

export default function MembersPage() {
  const { conversation } = useOutletContext();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isOnline } = usePresence();
  const { members, isAdmin, removeMember } = useMembers(conversation.id);
  const [actionError, setActionError] = useState("");

  const handleRemove = async (userId) => {
    setActionError("");
    setActionError((await removeMember(userId)) || "");
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>{conversation.name} · members</h1>
        <div className="header-actions">
          {isAdmin && (
            <button className="switch-button" onClick={() => navigate(`/chats/${conversation.id}/members/add`)}>
              Add
            </button>
          )}
          <button className="switch-button" onClick={() => navigate(`/chats/${conversation.id}`)}>Back</button>
        </div>
      </div>

      <div className="group-info">
        <h2 className="group-info-title">About this group</h2>

        <p className="group-info-description">
          {conversation.description || "No description yet."}
        </p>

        {conversation.createdAt && (
          <p className="group-info-meta">
            Created {new Date(conversation.createdAt).toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      <div className="group-form">
        {actionError && <p className="login-error">{actionError}</p>}

        <div className="user-list">
          {members.map((member) => (
            <div key={member.id} className="user-item member-row">
              <span className={`status-dot ${isOnline(member.username) ? "online" : "offline"}`} />
              <span className="user-name">
                {member.username}
                {member.id === currentUser.id ? " (you)" : ""}
              </span>
              {member.role === "ADMIN" && <span className="badge">Admin</span>}
              {isAdmin && member.id !== currentUser.id && (
                <button className="danger-button" onClick={() => handleRemove(member.id)}>
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
