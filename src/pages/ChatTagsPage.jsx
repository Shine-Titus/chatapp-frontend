import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useTags } from "../context/TagsContext";
import { titleOf } from "../utils/conversation";

// Tick the tags that apply to this one conversation.
export default function ChatTagsPage() {
  const { conversation } = useOutletContext();
  const navigate = useNavigate();
  const { tags, toggleConversationTag } = useTags();
  const [tagError, setTagError] = useState("");

  const toggle = async (tag) => {
    setTagError("");
    setTagError((await toggleConversationTag(tag, conversation.id)) || "");
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>Tags for {titleOf(conversation)}</h1>
        <button className="switch-button" onClick={() => navigate(`/chats/${conversation.id}`)}>Back</button>
      </div>

      <div className="group-form">
        {tagError && <p className="login-error">{tagError}</p>}

        <div className="user-list">
          {tags.length === 0 && (
            <p className="user-list-empty">
              No tags yet. <button className="link-button" onClick={() => navigate("/tags")}>Create one</button>
            </p>
          )}
          {tags.map((t) => (
            <label key={t.id} className="user-item">
              <input
                type="checkbox"
                checked={(t.conversationIds || []).includes(conversation.id)}
                onChange={() => toggle(t)}
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
