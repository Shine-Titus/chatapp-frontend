import { useInboxFilter } from "../../context/InboxFilterContext";
import { useTags } from "../../context/TagsContext";

export default function TagFilter() {
  const { tags } = useTags();
  const { activeTags, toggleTag } = useInboxFilter();

  if (tags.length === 0) return null;

  return (
    <div className="filter-tabs">
      {tags.map((t) => (
        <button
          key={t.id}
          className={`filter-tab ${activeTags.has(t.id) ? "active" : ""}`}
          onClick={() => toggleTag(t.id)}
        >
          <span className="tag-dot" style={{ background: t.color || "#2563eb" }} />
          {t.name}
        </button>
      ))}
    </div>
  );
}
