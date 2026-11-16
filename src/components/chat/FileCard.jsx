import { useState } from "react";
import { useFiles } from "../../hooks/useFiles";

// A FILE message: file name, caption and a download button.
export default function FileCard({ message }) {
  const { downloadFile } = useFiles();
  const [error, setError] = useState("");

  const handleDownload = async () => {
    setError((await downloadFile(message.fileId, message.fileName)) || "");
  };

  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: 8,
        borderRadius: 8,
        background: "rgba(0, 0, 0, 0.08)",
      }}
    >
      <span style={{ fontSize: 20 }}>📄</span>

      <span style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
        <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {message.fileName || "File"}
        </span>
        {message.content && <span>{message.content}</span>}
        {error && <span className="login-error">{error}</span>}
      </span>

      <button type="button" onClick={handleDownload} title="Download">⬇</button>
    </span>
  );
}