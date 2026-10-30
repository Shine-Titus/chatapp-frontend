import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTags } from "../context/TagsContext";

// Create / delete your tags.
export default function TagsPage() {
  const navigate = useNavigate();
  const { tags, createTag, deleteTag } = useTags();

  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState("#2563eb");
  const [tagError, setTagError] = useState("");

  const handleCreate = async () => {
    setTagError("");
    const error = await createTag(tagName, tagColor);
    if (error) setTagError(error);
    else setTagName("");
  };

  const handleDelete = async (id) => {
    setTagError((await deleteTag(id)) || "");
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>My tags</h1>
        <button className="switch-button" onClick={() => navigate("/")}>Back</button>
      </div>

      <div className="group-form">
        {tagError && <p className="login-error">{tagError}</p>}

        <div className="tag-create">
          <input
            placeholder="New tag name"
            value={tagName}
            maxLength={30}
            onChange={(e) => setTagName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <input type="color" value={tagColor} onChange={(e) => setTagColor(e.target.value)} />
          <button className="create-group-button" onClick={handleCreate}>Add</button>
        </div>

        <div className="user-list">
          {tags.length === 0 && <p className="user-list-empty">No tags yet.</p>}
          {tags.map((t) => (
            <div key={t.id} className="user-item member-row">
              <span className="tag-dot" style={{ background: t.color || "#2563eb" }} />
              <span className="user-name">{t.name}</span>
              <span className="group-hint">{(t.conversationIds || []).length} chats</span>
              <button className="danger-button" onClick={() => handleDelete(t.id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
