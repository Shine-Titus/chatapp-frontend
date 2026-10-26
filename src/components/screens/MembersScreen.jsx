function MembersScreen({
  selectedConversation,
  isAdmin,
  setActionError,
  setScreen,
  actionError,
  members,
  onlineUsers,
  currentUser,
  removeMember,
}) {
  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>{selectedConversation.name} · members</h1>
        <div className="header-actions">
          {isAdmin && (
            <button className="switch-button" onClick={() => { setActionError(""); setScreen("addMembers"); }}>
              Add
            </button>
          )}
          <button className="switch-button" onClick={() => setScreen("chat")}>Back</button>
        </div>
      </div>

      <div className="group-info">
        <h2 className="group-info-title">About this group</h2>

        <p className="group-info-description">
          {selectedConversation.description || "No description yet."}
        </p>

        {selectedConversation.createdAt && (
          <p className="group-info-meta">
            Created {new Date(selectedConversation.createdAt).toLocaleDateString(undefined, {
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
              <span className={`status-dot ${onlineUsers.has(member.username) ? "online" : "offline"}`} />
              <span className="user-name">
                {member.username}
                {member.id === currentUser.id ? " (you)" : ""}
              </span>
              {member.role === "ADMIN" && <span className="badge">Admin</span>}
              {isAdmin && member.id !== currentUser.id && (
                <button className="danger-button" onClick={() => removeMember(member.id)}>
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

export default MembersScreen;
