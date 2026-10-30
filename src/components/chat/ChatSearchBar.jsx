import { useState } from "react";
import RecentDropdown from "../RecentDropdown";

// `search` comes from useChatSearch, `recent` from useRecentSearches.
export default function ChatSearchBar({ search, recent, onClose }) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="chat-search">
      <input
        type="text"
        placeholder="Search in this conversation..."
        value={search.query}
        onChange={(e) => search.setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          recent.save(search.query);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            recent.save(search.query);
            search.next();
          }
        }}
        autoFocus
      />

      <div className="search-navigation">
        <span className="search-counter">
          {search.count > 0 ? `${search.position + 1} of ${search.count}` : "0 of 0"}
        </span>

        <button type="button" onClick={search.prev} disabled={search.count === 0} title="Previous match">
          ↑
        </button>

        <button type="button" onClick={search.next} disabled={search.count === 0} title="Next match">
          ↓
        </button>
      </div>

      {focused && !search.query && recent.items.length > 0 && (
        <RecentDropdown
          items={recent.items}
          onPick={search.setQuery}
          onRemove={recent.remove}
          onClear={recent.clear}
        />
      )}

      <button className="chat-search-close" onClick={onClose}>
        ✕
      </button>
    </div>
  );
}
