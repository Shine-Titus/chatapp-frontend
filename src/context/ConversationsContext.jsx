import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useMatch } from "react-router-dom";
import { request } from "../api";
import { useAuth } from "./AuthContext";
import { useSocketSubscription } from "./SocketContext";

const ConversationsContext = createContext(null);

const sameId = (a, b) => String(a) === String(b);

// The conversation list, unread counters and the actions that create conversations.
export function ConversationsProvider({ children }) {
  const { currentUser, endSession } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // which chat is open? (route /chats/:conversationId and its sub-pages)
  const openMatch = useMatch({ path: "/chats/:conversationId", end: false });
  const openId = openMatch?.params.conversationId ?? null;

  const refreshConversations = useCallback(() => {
    return request("/conversations")
      .then((res) => {
        if (res.status === 403) {
          endSession();
          return null;
        }
        return res.ok ? res.json() : [];
      })
      .then((data) => {
        if (data) setConversations(Array.isArray(data) ? data : []);
      })
      .catch(() => { })
      .finally(() => setLoaded(true));
  }, [endSession]);

  const markRead = useCallback((conversationId) => {
    request(`/conversations/${conversationId}/read`, { method: "POST" }).catch(() => { });

    setConversations((prev) =>
      prev.map((c) => (sameId(c.id, conversationId) ? { ...c, unreadCount: 0 } : c))
    );
  }, []);

  const upsertConversation = useCallback((conversation) => {
    setConversations((prev) =>
      prev.some((c) => c.id === conversation.id)
        ? prev.map((c) => (c.id === conversation.id ? { ...c, ...conversation } : c))
        : [conversation, ...prev]
    );
  }, []);

  // returns the conversation, or null (session ended / failed)
  const createDirectConversation = useCallback(async (userId) => {
    const res = await request("/conversations/direct", { method: "POST", body: { userId } });

    if (res.status === 403) {
      endSession();
      return null;
    }
    if (!res.ok) {
      console.error("Could not open chat", res.status);
      return null;
    }

    const conversation = await res.json();
    upsertConversation(conversation);
    return conversation;
  }, [endSession, upsertConversation]);

  // returns { group } or { error }
  const createGroup = useCallback(async ({ name, description, participantIds }) => {
    const res = await request("/conversations", {
      method: "POST",
      body: { name, description, participantIds },
    });

    if (res.status === 403) {
      endSession();
      return { error: null };
    }
    if (!res.ok) return { error: "Could not create group" };

    const group = await res.json();
    upsertConversation(group);
    return { group };
  }, [endSession, upsertConversation]);

  // incoming messages: keep unread counters right for chats that are NOT open
  // (the open chat appends the message itself in useMessages)
  useSocketSubscription("/user/queue/messages", (frame) => {
    const message = JSON.parse(frame.body);
    const fromMe = message.senderId === currentUser.id;

    if (openId !== null && sameId(message.conversationId, openId)) {
      if (!fromMe) markRead(message.conversationId);
      return;
    }

    const known = conversations.some((c) => c.id === message.conversationId);
    if (known) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === message.conversationId ? { ...c, unreadCount: (c.unreadCount || 0) + 1 } : c
        )
      );
    } else {
      refreshConversations(); // brand new chat or group
    }
  });

  const value = useMemo(
    () => ({
      conversations,
      loaded,
      refreshConversations,
      markRead,
      createDirectConversation,
      createGroup,
    }),
    [conversations, loaded, refreshConversations, markRead, createDirectConversation, createGroup]
  );

  return <ConversationsContext.Provider value={value}>{children}</ConversationsContext.Provider>;
}

export function useConversations() {
  const ctx = useContext(ConversationsContext);
  if (!ctx) throw new Error("useConversations must be used inside <ConversationsProvider>");
  return ctx;
}

// Look one conversation up by the id in the URL (loads the list if we landed here directly).
export function useConversation(id) {
  const { conversations, loaded, refreshConversations } = useConversations();

  useEffect(() => {
    if (!loaded) refreshConversations();
  }, [loaded, refreshConversations]);

  const conversation = conversations.find((c) => sameId(c.id, id)) ?? null;
  return { conversation, loaded };
}
