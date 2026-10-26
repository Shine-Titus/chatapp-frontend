function NewGroupScreen({
  cancelGroup,
  groupError,
  groupName,
  setGroupName,
  groupDesc,
  setGroupDesc,
  groupMembers,
  users,
  toggleMember,
  createGroup,
}) {
  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>New group</h1>
        <button className="switch-button" onClick={cancelGroup}>Back</button>
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

        <div className="user-list">
          {users.map((user) => (
            <label key={user.id} className="user-item">
              <input
                type="checkbox"
                checked={groupMembers.has(user.id)}
                onChange={() => toggleMember(user.id)}
              />
              <span className="user-name">{user.username}</span>
            </label>
          ))}
        </div>

        <button className="create-group-button" onClick={createGroup}>
          Create group
        </button>
      </div>
    </div>
  );
}

export default NewGroupScreen;
