import { titleOf } from "../../utils/titleOf.js";

function ChatTagsScreen({
  selectedConversation,
  setTagError,
  setScreen,
  tagError,
  tags,
  toggleConversationTag,
}) {
  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>Tags for {titleOf(selectedConversation)}</h1>
        <button className="switch-button" onClick={() => { setTagError(""); setScreen("chat"); }}>Back</button>
      </div>

      <div className="group-form">
        {tagError && <p className="login-error">{tagError}</p>}

        <div className="user-list">

          {tags.length === 0 && (
            <p className="user-list-empty">
              No tags yet. <button className="link-button" onClick={() => setScreen("tags")}>Create one</button>
            </p>
          )}

          {tags.map((t) => (
            <label key={t.id} className="user-item">
              <input
                type="checkbox"
                checked={(t.conversationIds || []).includes(selectedConversation.id)}
                onChange={() => toggleConversationTag(t, selectedConversation.id)}
              />
              <span className="tag-dot" style={{ background: t.color || "#2563eb" }} />
              <span className="user-name">{t.name}</span>
            </label>
          ))}

        </div>
      </div>
    </div>
  );
}

export default ChatTagsScreen;
