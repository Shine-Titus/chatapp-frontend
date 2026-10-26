function AddMembersScreen({
  users,
  members,
  selectedConversation,
  setAddSelection,
  setScreen,
  actionError,
  addSelection,
  toggleAddSelection,
  addMembers,
}) {
  const candidates = users.filter((u) => !members.some((m) => m.id === u.id));

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>Add to {selectedConversation.name}</h1>
        <button className="switch-button" onClick={() => { setAddSelection(new Set()); setScreen("members"); }}>
          Back
        </button>
      </div>

      <div className="group-form">
        {actionError && <p className="login-error">{actionError}</p>}

        <p className="group-hint">Select users ({addSelection.size})</p>

        <div className="user-list">
          {candidates.length === 0 && <p className="user-list-empty">Everyone is already in this group.</p>}

          {candidates.map((user) => (
            <label key={user.id} className="user-item">
              <input
                type="checkbox"
                checked={addSelection.has(user.id)}
                onChange={() => toggleAddSelection(user.id)}
              />
              <span className="user-name">{user.username}</span>
            </label>
          ))}
        </div>

        <button className="create-group-button" onClick={addMembers}>
          Add selected
        </button>
      </div>
    </div>
  );
}

export default AddMembersScreen;
