import { removeRecent, clearRecent } from "../../utils/recentSearches.js";

function ChatSearchBar({
  chatQuery,
  setChatQuery,
  setChatSearchFocused,
  saveChatSearch,
  setCurrentMessageIndex,
  matchingMessages,
  currentMessageIndex,
  chatSearchFocused,
  chatRecent,
  setChatRecent,
  chatKey,
  setShowSearch,
}) {
  return (
    <div className="chat-search">
      <input
        type="text"
        placeholder="Search in this conversation..."
        value={chatQuery}
        onChange={(e) => setChatQuery(e.target.value)}
        onFocus={() => setChatSearchFocused(true)}
        onBlur={() => { setChatSearchFocused(false); saveChatSearch(); }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            saveChatSearch();
            setCurrentMessageIndex(prev => prev + 1);
          }
        }}
        autoFocus
      />

      <div className="search-navigation">
        <span className="search-counter">
          {matchingMessages.length > 0
            ? `${currentMessageIndex + 1} of ${matchingMessages.length}`
            : "0 of 0"}
        </span>

        <button
          type="button"
          onClick={() => { currentMessageIndex > 0 ? setCurrentMessageIndex(prev => prev - 1) : setCurrentMessageIndex(prev => prev - 0) }}
          disabled={matchingMessages.length === 0}
          title="Previous match"
        >
          ↑
        </button>

        <button
          type="button"
          onClick={() => { currentMessageIndex < matchingMessages.length - 1 ? setCurrentMessageIndex(prev => prev + 1) : setCurrentMessageIndex(prev => prev + 0) }}
          disabled={matchingMessages.length === 0}
          title="Next match"
        >
          ↓
        </button>
      </div>

      {chatSearchFocused && !chatQuery && chatRecent.length > 0 && (
        <div className="recent-dropdown">
          <div className="recent-header">
            <span>Recent searches</span>
            <button
              className="recent-clear"
              onMouseDown={(e) => { e.preventDefault(); setChatRecent(clearRecent(chatKey)); }}
            >
              Clear all
            </button>
          </div>

          {chatRecent.map((term) => (
            <div
              key={term}
              className="recent-item"
              onMouseDown={(e) => { e.preventDefault(); setChatQuery(term); }}
            >
              <span className="recent-term">{term}</span>
              <button
                className="recent-remove"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setChatRecent(removeRecent(chatKey, term));
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        className="chat-search-close"
        onClick={() => { setShowSearch(false); setChatQuery(""); }}
      >
        ✕
      </button>

    </div>
  );
}

export default ChatSearchBar;
