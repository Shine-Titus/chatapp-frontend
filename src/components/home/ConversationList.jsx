import { useNavigate } from "react-router-dom";
import { useInboxFilter } from "../../context/InboxFilterContext";
import { usePresence } from "../../context/PresenceContext";
import { useTags } from "../../context/TagsContext";
import { isConversationActive, titleOf } from "../../utils/conversation";

export default function ConversationList() {
  const navigate = useNavigate();
  const { isOnline } = usePresence();
  const { tagsByConversation } = useTags();
  const { filteredConversations } = useInboxFilter();

  return (
    <div className="user-list">
      {filteredConversations.length === 0 && <p className="user-list-empty">No conversations yet.</p>}

      {filteredConversations.map((conversation) => (
        <button
          key={conversation.id}
          className="user-item"
          onClick={() => navigate(`/chats/${conversation.id}`)}
        >
          {conversation.type === "DIRECT" && (
            <span className={`status-dot ${isOnline(conversation.otherUsername) ? "online" : "offline"}`} />
          )}
          <span className="user-name">{titleOf(conversation)}</span>

          {(tagsByConversation[conversation.id] || []).slice(0, 3).map((t) => (
            <span key={t.id} className="tag-chip" style={{ background: t.color || "#2563eb" }}>
              {t.name}
            </span>
          ))}

          {conversation.unreadCount > 0 && (
            <span className="unread-badge">
              {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
            </span>
          )}
          {conversation.type === "GROUP" && !isConversationActive(conversation) && (
            <span className="removed-tag">(removed)</span>
          )}
        </button>
      ))}
    </div>
  );
}
