import { useCallback, useEffect, useMemo, useState } from "react";

// "Find in this chat": which messages match, which match is current, and
// scrolling/flashing that match.
export function useChatSearch(messages) {
  const [query, setQueryState] = useState("");
  const [index, setIndex] = useState(0);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return messages.filter((m) => (m.content || "").toLowerCase().includes(q));
  }, [messages, query]);

  const position = Math.min(index, Math.max(matches.length - 1, 0));
  const current = matches[position] ?? null;

  const setQuery = useCallback((value) => {
    setQueryState(value);
    setIndex(0);
  }, []);

  const next = () => setIndex(Math.min(position + 1, matches.length - 1));
  const prev = () => setIndex(Math.max(position - 1, 0));

  const currentId = current?.id;
  useEffect(() => {
    if (currentId === undefined) return;

    const el = document.querySelector(`[data-message-id="${currentId}"]`);
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("active-search-match");

    const timeout = setTimeout(() => el.classList.remove("active-search-match"), 400);
    return () => clearTimeout(timeout);
  }, [currentId]);

  return { query, setQuery, count: matches.length, position, next, prev };
}
