import { request } from "../api";
import { useAuth } from "../context/AuthContext";

// Upload a file to a conversation / download one to the user's computer.
// Both return an error string, or null when everything went fine.
//
//   POST /files      multipart: file, conversationId, caption
//   GET  /files/{id} -> the file
export function useFiles() {
  const { endSession } = useAuth();

  const uploadFile = async (conversationId, file, caption) => {
    const form = new FormData();
    form.append("file", file);
    form.append("conversationId", conversationId);
    form.append("caption", caption);

    const res = await request("/files", { method: "POST", body: form }).catch(() => null);

    if (!res) return "Cannot reach the server";
    if (res.status === 403) { endSession(); return null; }
    if (res.status === 413) return "File is too large";
    if (!res.ok) return "Could not upload file";

    return null;
  };

  const downloadFile = async (fileId, fileName) => {
    console.log(fileId);
    const res = await request(`/files/${fileId}`).catch(() => null);



    if (!res) return "Could not download file";
    if (res.status === 403) { endSession(); return null; }
    if (!res.ok) return "Could not download file";

    // turn the response into a temporary link and click it so the browser saves it
    const url = URL.createObjectURL(await res.blob());
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || "download";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    return null;
  };

  return { uploadFile, downloadFile };
}