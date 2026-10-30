import { useNavigate } from "react-router-dom";
import { useConversations } from "../../context/ConversationsContext";
import { titleOf } from "../../utils/conversation";

// Message hits grouped by conversation. Clicking a hit opens the chat and jumps to that message.
export default function MessageSearchResults({ hits }) {
  const navigate = useNavigate();
  const { conversations } = useConversations();

  return (
    <div className="search-results">
      {hits.map((hit) => {
        const conversation = conversations.find((c) => c.id === hit.conversationId);
        if (!conversation) return null;

        const open = (state) => navigate(`/chats/${conversation.id}`, { state });

        return (
          <div key={hit.conversationId} className="result-card">
            <button type="button" className="result-title" onClick={() => open()}>
              {titleOf(conversation)}
              <span className="result-count">{hit.matches.length}</span>
            </button>

            {hit.matches.map((match) => (
              <button
                key={match.messageId}
                type="button"
                className="result-hit"
                onClick={() => open({ jumpTo: match.messageId })}
              >
                <div className="result-meta">
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span>{match.senderUsername}</span>
                    <span>{match.snippet}</span>
                  </div>

                  <span>
                    {new Date(match.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
}
