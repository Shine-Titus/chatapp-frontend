function FilterTabs({ filter, setFilter, unreadTotal }) {
  return (
    <div className="filter-tabs">
      {[
        ["all", "All"],
        ["unread", "Unread"],
        ["direct", "Direct"],
        ["group", "Groups"],
      ].map(([key, label]) => (
        <button
          key={key}
          className={`filter-tab ${filter === key ? "active" : ""}`}
          onClick={() => setFilter(key)}
        >
          {label}
          {key === "unread" && unreadTotal > 0 && (
            <span className="filter-count">{unreadTotal}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export default FilterTabs;
