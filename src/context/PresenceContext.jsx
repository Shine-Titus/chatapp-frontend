import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { request } from "../api";
import { useSocketSubscription } from "./SocketContext";

const PresenceContext = createContext(null);

// Who is online right now.
export function PresenceProvider({ children }) {
  const [onlineUsers, setOnlineUsers] = useState(() => new Set());

  useEffect(() => {
    request("/users/online")
      .then((res) => (res.ok ? res.json() : []))
      .then((list) => setOnlineUsers(new Set(list)))
      .catch(() => { });
  }, []);

  useSocketSubscription("/topic/presence", (frame) => {
    const { username, online } = JSON.parse(frame.body);

    setOnlineUsers((prev) => {
      const next = new Set(prev);
      if (online) next.add(username);
      else next.delete(username);
      return next;
    });
  });

  const isOnline = useCallback((username) => onlineUsers.has(username), [onlineUsers]);
  const value = useMemo(() => ({ isOnline }), [isOnline]);

  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>;
}

export function usePresence() {
  const ctx = useContext(PresenceContext);
  if (!ctx) throw new Error("usePresence must be used inside <PresenceProvider>");
  return ctx;
}
