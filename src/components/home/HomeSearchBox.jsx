import { useState } from "react";
import RecentDropdown from "../RecentDropdown";
import { useAuth } from "../../context/AuthContext";
import { useInboxFilter } from "../../context/InboxFilterContext";
import { useRecentSearches } from "../../hooks/useRecentSearches";

export default function HomeSearchBox() {
  const { currentUser } = useAuth();
  const { query, setQuery } = useInboxFilter();
  const recent = useRecentSearches(`recent:home:${currentUser.id}`);
  const [focused, setFocused] = useState(false);

  return (
    <div className="search-wrap">
      <input
        className="search"
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          recent.save(query);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            recent.save(query);
            e.target.blur();
          }
        }}
      />

      {focused && !query && recent.items.length > 0 && (
        <RecentDropdown
          items={recent.items}
          onPick={setQuery}
          onRemove={recent.remove}
          onClear={recent.clear}
        />
      )}
    </div>
  );
}
