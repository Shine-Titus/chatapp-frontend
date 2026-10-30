import { useCallback, useEffect, useState } from "react";
import { request } from "../api";
import { useAuth } from "../context/AuthContext";
import { useSocket, useSocketSubscription } from "../context/SocketContext";

// Message history + live updates + sending for ONE conversation.
export function useMessages(conversationId) {
  const { endSession } = useAuth();
  const { publish } = useSocket();
  const [messages, setMessages] = useState([]);

  // history
  useEffect(() => {
    let cancelled = false;

    request(`/conversations/${conversationId}/messages`)
      .then((res) => {
        if (res.status === 403) {
          endSession();
          return null;
        }
        return res.json();
      })
      .then((history) => {
        if (cancelled || !Array.isArray(history)) return;
        // keep anything that arrived over the socket while history was loading
        setMessages((prev) => {
          const ids = new Set(history.map((m) => m.id));
          return [...history, ...prev.filter((m) => !ids.has(m.id))];
        });
      })
      .catch(() => { });

    return () => { cancelled = true; };
  }, [conversationId, endSession]);

  // live
  useSocketSubscription("/user/queue/messages", (frame) => {
    const incoming = JSON.parse(frame.body);
    if (incoming.conversationId !== conversationId) return;
    setMessages((prev) => (prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]));
  });

  // returns true when the message was handed to the socket
  const sendMessage = useCallback(
    (content) => publish("/app/chat", { conversationId, content }),
    [publish, conversationId]
  );

  return { messages, sendMessage };
}
