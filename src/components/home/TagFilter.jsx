function TagFilter({ tags, activeTags, removeFromTags, addToTags }) {
  return (
    <div className="filter-tabs">
      {tags.map((t) => (
        <button
          key={t.id}
          className={`filter-tab ${activeTags.has(t.id) ? "active" : ""}`}
          onClick={() => { activeTags.has(t.id) ? removeFromTags(t.id) : addToTags(t.id) }}
        >
          <span className="tag-dot" style={{ background: t.color || "#2563eb" }} />
          {t.name}
        </button>
      ))}
    </div>
  );
}

export default TagFilter;
