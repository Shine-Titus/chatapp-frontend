import { titleOf } from "../../utils/titleOf.js";

function SearchResults({ messageHits, conversations, openConversation, pendingJumpRef }) {
  return (
    <div className="search-results">
      {messageHits.map((hit) => {
        const conversation = conversations.find((c) => c.id === hit.conversationId);
        if (!conversation) return null;

        return (
          <div key={hit.conversationId} className="result-card">
            <button
              type="button"
              className="result-title"
              onClick={() => openConversation(conversation)}
            >
              {titleOf(conversation)}
              <span className="result-count">{hit.matches.length}</span>
            </button>

            {hit.matches.map((match) => (
              <button
                key={match.messageId}
                type="button"
                className="result-hit"
                onClick={() => {
                  pendingJumpRef.current = match.messageId;
                  openConversation(conversation);
                }}
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

export default SearchResults;
