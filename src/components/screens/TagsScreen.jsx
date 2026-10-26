function TagsScreen({
  setTagError,
  setScreen,
  tagError,
  tagName,
  setTagName,
  tagColor,
  setTagColor,
  createTag,
  tags,
  deleteTag,
}) {
  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>My tags</h1>
        <button className="switch-button" onClick={() => { setTagError(""); setScreen("home"); }}>Back</button>
      </div>

      <div className="group-form">
        {tagError && <p className="login-error">{tagError}</p>}

        <div className="tag-create">
          <input
            placeholder="New tag name"
            value={tagName}
            maxLength={30}
            onChange={(e) => setTagName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createTag()}
          />
          <input type="color" value={tagColor} onChange={(e) => setTagColor(e.target.value)} />
          <button className="create-group-button" onClick={createTag}>Add</button>
        </div>

        <div className="user-list">
          {tags.length === 0 && <p className="user-list-empty">No tags yet.</p>}
          {tags.map((t) => (
            <div key={t.id} className="user-item member-row">
              <span className="tag-dot" style={{ background: t.color || "#2563eb" }} />
              <span className="user-name">{t.name}</span>
              <span className="group-hint">{(t.conversationIds || []).length} chats</span>
              <button className="danger-button" onClick={() => deleteTag(t.id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TagsScreen;
