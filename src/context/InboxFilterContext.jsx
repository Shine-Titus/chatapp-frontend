import { createContext, useContext, useMemo, useState } from "react";
import { useConversations } from "./ConversationsContext";
import { useTags } from "./TagsContext";
import { useToggleSet } from "../hooks/useToggleSet";
import { titleOf } from "../utils/conversation";

const InboxFilterContext = createContext(null);

// The home screen's search text, tab filter and tag filter.
// Lives in a context (not in HomePage) so it survives opening a chat and coming back.
export function InboxFilterProvider({ children }) {
  const { conversations } = useConversations();
  const { tags, tagsByConversation } = useTags();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedTagIds, toggleTag] = useToggleSet();

  // ignore tags that were deleted after being selected
  const activeTags = useMemo(
    () => new Set(tags.filter((t) => selectedTagIds.has(t.id)).map((t) => t.id)),
    [tags, selectedTagIds]
  );

  const filteredConversations = useMemo(() => {
    const raw = query.trim().toLowerCase();
    const isTagSearch = raw.startsWith("#");
    const term = isTagSearch ? raw.slice(1) : raw;

    const matchesTab = (c) => {
      if (filter === "unread") return c.unreadCount > 0;
      if (filter === "direct") return c.type === "DIRECT";
      if (filter === "group") return c.type === "GROUP";
      return true;
    };

    const matchesTag = (c) =>
      activeTags.size === 0 || (tagsByConversation[c.id] || []).some((t) => activeTags.has(t.id));

    const matchesText = (c) =>
      isTagSearch
        ? (tagsByConversation[c.id] || []).some((t) => t.name.toLowerCase().startsWith(term))
        : (titleOf(c) || "").toLowerCase().includes(term);

    return conversations.filter((c) => matchesTab(c) && matchesTag(c) && matchesText(c));
  }, [conversations, tagsByConversation, query, filter, activeTags]);

  const unreadTotal = useMemo(
    () => conversations.filter((c) => c.unreadCount > 0).length,
    [conversations]
  );

  const value = {
    query, setQuery,
    filter, setFilter,
    activeTags, toggleTag,
    filteredConversations,
    unreadTotal,
  };

  return <InboxFilterContext.Provider value={value}>{children}</InboxFilterContext.Provider>;
}

export function useInboxFilter() {
  const ctx = useContext(InboxFilterContext);
  if (!ctx) throw new Error("useInboxFilter must be used inside <InboxFilterProvider>");
  return ctx;
}
