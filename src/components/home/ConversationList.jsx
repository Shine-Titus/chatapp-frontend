import { titleOf } from "../../utils/titleOf.js";

function ConversationList({ filteredConversations, onlineUsers, openConversation }) {
  return (
    <div className="user-list">
      {filteredConversations.length === 0 && <p className="user-list-empty">No conversations yet.</p>}

      {filteredConversations.map((conversation) => (
        <button key={conversation.id} className="user-item" onClick={() => openConversation(conversation)}>
          {conversation.type === "DIRECT" && (
            <span
              className={`status-dot ${onlineUsers.has(conversation.otherUsername) ? "online" : "offline"}`}
            />
          )}
          <span className="user-name">{titleOf(conversation)}</span>
          {conversation.unreadCount > 0 && (
            <span className="unread-badge">
              {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
            </span>
          )}
          {conversation.type === "GROUP" && conversation.active === false && (
            <span className="removed-tag">(removed)</span>
          )}
        </button>
      ))}
    </div>
  );
}

export default ConversationList;
