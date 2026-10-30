import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { Client } from "@stomp/stompjs";
import { WS_URL } from "../config";

const SocketContext = createContext(null);

// One STOMP connection for the whole signed-in session.
// Components don't touch the client; they call useSocketSubscription(destination, handler)
// and the provider (re)subscribes for them on every (re)connect.
export function SocketProvider({ children }) {
  const clientRef = useRef(null);
  const handlers = useRef(new Map());   // destination -> Set<handler>
  const stompSubs = useRef(new Map());  // destination -> live STOMP subscription

  const ensureSubscribed = useCallback((destination) => {
    const client = clientRef.current;
    if (!client || !client.connected || stompSubs.current.has(destination)) return;

    const sub = client.subscribe(destination, (frame) => {
      handlers.current.get(destination)?.forEach((handler) => handler(frame));
    });
    stompSubs.current.set(destination, sub);
  }, []);

  useEffect(() => {
    const client = new Client({
      brokerURL: WS_URL,

      onConnect: () => {
        console.log("STOMP connected");
        stompSubs.current.clear();
        handlers.current.forEach((_, destination) => ensureSubscribed(destination));
      },
      onDisconnect: () => console.log("STOMP disconnected"),
      onStompError: (frame) => console.error("STOMP error:", frame),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
      stompSubs.current.clear();
    };
  }, [ensureSubscribed]);

  const subscribe = useCallback((destination, handler) => {
    let set = handlers.current.get(destination);
    if (!set) {
      set = new Set();
      handlers.current.set(destination, set);
    }
    set.add(handler);
    ensureSubscribed(destination); // no-op until connected; onConnect picks it up

    return () => set.delete(handler);
  }, [ensureSubscribed]);

  const publish = useCallback((destination, body) => {
    const client = clientRef.current;
    if (!client || !client.connected) {
      console.log("STOMP not connected");
      return false;
    }
    client.publish({ destination, body: JSON.stringify(body) });
    return true;
  }, []);

  const value = useMemo(() => ({ subscribe, publish }), [subscribe, publish]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used inside <SocketProvider>");
  return ctx;
}

// Subscribe to a destination for as long as the calling component is mounted.
// The handler may close over fresh state/props: the latest one is always called.
export function useSocketSubscription(destination, handler) {
  const { subscribe } = useSocket();
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(
    () => subscribe(destination, (frame) => handlerRef.current(frame)),
    [subscribe, destination]
  );
}
