// Dropdown of recent searches, shared by the home search box and the in-chat search.
// onMouseDown (+ preventDefault) is used so the input doesn't blur before the click lands.
export default function RecentDropdown({ items, onPick, onRemove, onClear }) {
  return (
    <div className="recent-dropdown">
      <div className="recent-header">
        <span>Recent searches</span>
        <button
          className="recent-clear"
          onMouseDown={(e) => {
            e.preventDefault();
            onClear();
          }}
        >
          Clear all
        </button>
      </div>

      {items.map((term) => (
        <div
          key={term}
          className="recent-item"
          onMouseDown={(e) => {
            e.preventDefault();
            onPick(term);
          }}
        >
          <span className="recent-term">{term}</span>
          <button
            className="recent-remove"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove(term);
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
