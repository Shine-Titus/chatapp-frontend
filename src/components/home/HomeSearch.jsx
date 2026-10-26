import { removeRecent, clearRecent } from "../../utils/recentSearches.js";

function HomeSearch({
  query,
  setQuery,
  setSearchFocused,
  setSearching,
  saveHomeSearch,
  searchFocused,
  recent,
  setRecent,
  homeKey,
}) {
  return (
    <div className="search-wrap">
      <input
        className="search"
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => { setSearchFocused(true), setSearching(true) }}
        onBlur={() => {
          setSearchFocused(false);
          saveHomeSearch();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            saveHomeSearch();
            e.target.blur();
          }
        }}
      />

      {searchFocused && !query && recent.length > 0 && (
        <div className="recent-dropdown">
          <div className="recent-header">
            <span>Recent searches</span>
            <button
              className="recent-clear"
              onMouseDown={(e) => {
                e.preventDefault();
                setRecent(clearRecent(homeKey));
              }}
            >
              Clear all
            </button>
          </div>

          {recent.map((term) => (
            <div
              key={term}
              className="recent-item"
              onMouseDown={(e) => {
                e.preventDefault();
                setQuery(term);
              }}
            >
              <span className="recent-term">{term}</span>
              <button
                className="recent-remove"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setRecent(removeRecent(homeKey, term));
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomeSearch;
