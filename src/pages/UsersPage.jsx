import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useConversations } from "../context/ConversationsContext";
import { usePresence } from "../context/PresenceContext";
import { useUsers } from "../hooks/useUsers";

// "New chat": pick a user to start (or reopen) a direct conversation.
export default function UsersPage() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { createDirectConversation } = useConversations();
  const { isOnline } = usePresence();
  const users = useUsers();

  const openDirect = async (userId) => {
    const conversation = await createDirectConversation(userId);
    if (conversation) navigate(`/chats/${conversation.id}`);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>All Users, {currentUser.username}</h1>
        <button className="switch-button" onClick={() => navigate("/")}>Back</button>
        <button className="switch-button" onClick={logout}>Logout</button>
      </div>

      <div className="user-list">
        {users.length === 0 && <p className="user-list-empty">No other users yet.</p>}

        {users.map((user) => (
          <button key={user.id} className="user-item" onClick={() => openDirect(user.id)}>
            <span className={`status-dot ${isOnline(user.username) ? "online" : "offline"}`} />
            <span className="user-name">{user.username}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
