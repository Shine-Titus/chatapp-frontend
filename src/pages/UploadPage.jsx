import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useFiles } from "../hooks/useFiles";
import { titleOf } from "../utils/conversation";

// Pick a file + optional caption, upload it, then go back to the chat.
export default function UploadFilePage() {
  const { conversation } = useOutletContext();
  const navigate = useNavigate();
  const { uploadFile } = useFiles();

  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const backToChat = () => navigate(`/chats/${conversation.id}`);

  const submit = async () => {
    setError("");
    if (!file) return setError("Choose a file");

    setUploading(true);
    const problem = await uploadFile(conversation.id, file, caption.trim());
    setUploading(false);

    if (problem) return setError(problem);
    backToChat();
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>Send file · {titleOf(conversation)}</h1>
        <button className="switch-button" onClick={backToChat}>Back</button>
      </div>

      <div className="group-form">
        {error && <p className="login-error">{error}</p>}

        <input type="file" onChange={(e) => setFile(e.target.files[0] ?? null)} />

        <input
          placeholder="Caption (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        <button className="create-group-button" onClick={submit} disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}