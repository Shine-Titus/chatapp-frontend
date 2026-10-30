import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { request } from "../api";
import { useAuth } from "./AuthContext";

const TagsContext = createContext(null);

// Tags + the actions that change them.
// Actions resolve to an error message (string) or null when everything went fine.
export function TagsProvider({ children }) {
  const { endSession } = useAuth();
  const [tags, setTags] = useState([]);

  useEffect(() => {
    request("/tags")
      .then((res) => {
        if (res.status === 403) {
          endSession();
          return [];
        }
        return res.ok ? res.json() : [];
      })
      .then((data) => setTags(Array.isArray(data) ? data : []))
      .catch(() => { });
  }, [endSession]);

  const tagsByConversation = useMemo(() => {
    const map = {};
    tags.forEach((t) => {
      (t.conversationIds || []).forEach((cid) => {
        (map[cid] ||= []).push(t);
      });
    });
    return map;
  }, [tags]);

  const createTag = useCallback(async (name, color) => {
    if (!name.trim()) return "Enter a tag name";

    const res = await request("/tags", { method: "POST", body: { name: name.trim(), color } });

    if (res.status === 403) { endSession(); return null; }
    if (res.status === 409) return "Tag already exists";
    if (!res.ok) return "Could not create tag";

    const tag = await res.json();
    setTags((prev) => [...prev, tag]);
    return null;
  }, [endSession]);

  const deleteTag = useCallback(async (tagId) => {
    const res = await request(`/tags/${tagId}`, { method: "DELETE" });

    if (res.status === 403) { endSession(); return null; }
    if (!res.ok) return "Could not delete tag";

    setTags((prev) => prev.filter((t) => t.id !== tagId));
    return null;
  }, [endSession]);

  // attach or detach one conversation; the server returns the updated tag
  const toggleConversationTag = useCallback(async (tag, conversationId) => {
    const has = (tag.conversationIds || []).includes(conversationId);

    const res = await request(
      has ? `/tags/${tag.id}/conversations/${conversationId}` : `/tags/${tag.id}/conversations`,
      has
        ? { method: "DELETE" }
        : { method: "POST", body: { conversationIds: [conversationId] } }
    );

    if (res.status === 403) { endSession(); return null; }
    if (!res.ok) return "Could not update tag";

    const updated = await res.json();
    setTags((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    return null;
  }, [endSession]);

  const value = useMemo(
    () => ({ tags, tagsByConversation, createTag, deleteTag, toggleConversationTag }),
    [tags, tagsByConversation, createTag, deleteTag, toggleConversationTag]
  );

  return <TagsContext.Provider value={value}>{children}</TagsContext.Provider>;
}

export function useTags() {
  const ctx = useContext(TagsContext);
  if (!ctx) throw new Error("useTags must be used inside <TagsProvider>");
  return ctx;
}
