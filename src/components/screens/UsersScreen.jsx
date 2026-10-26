function UsersScreen({ currentUser, users, onlineUsers, setScreen, handleLogout, createDirectConversation }) {
  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>All Users, {currentUser.username}</h1>
        <button className="switch-button" onClick={() => setScreen("home")}>Back</button>
        <button className="switch-button" onClick={handleLogout}>Logout</button>
      </div>

      <div className="user-list">
        {users.length === 0 && <p className="user-list-empty">No other users yet.</p>}

        {users.map((user) => (
          <button key={user.id} className="user-item" onClick={() => createDirectConversation(user.id)}>
            <span className={`status-dot ${onlineUsers.has(user.username) ? "online" : "offline"}`} />
            <span className="user-name">{user.username}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default UsersScreen;
