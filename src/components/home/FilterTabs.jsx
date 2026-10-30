import { useInboxFilter } from "../../context/InboxFilterContext";

const TABS = [
  ["all", "All"],
  ["unread", "Unread"],
  ["direct", "Direct"],
  ["group", "Groups"],
];

export default function FilterTabs() {
  const { filter, setFilter, unreadTotal } = useInboxFilter();

  return (
    <div className="filter-tabs">
      {TABS.map(([key, label]) => (
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
