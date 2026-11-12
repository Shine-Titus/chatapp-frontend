import { useEffect, useState } from "react";
import { request } from "../api";
import { useAuth } from "../context/AuthContext";

export function useScheduledMessages(conversationId) {
  const { endSession } = useAuth();
  const [pending, setPending] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    request(`/schedule-message/${conversationId}`)
      .then((res) => {
        if (res.status === 403) {
          endSession();
          return null;
        }
        return res.ok ? res.json() : [];
      })
      .then((data) => {
        if (Array.isArray(data)) setPending(data);
      })
      .catch(() => { })
      .finally(() => setLoaded(true));
  }, [conversationId, endSession]);

  const schedule = async (content, sendAt) => {
    const res = await request("/schedule-message", {
      method: "POST",
      body: { conversationId, content, sendAt },
    });

    if (res.status === 403) { endSession(); return null; }
    if (!res.ok) return "Could not schedule message";

    const created = await res.json();
    setPending((prev) => [...prev, created]);
    return null;
  };

  const cancel = async (id) => {
    const res = await request(`/schedule-message/${id}`, { method: "DELETE" });

    if (res.status === 403) { endSession(); return null; }
    if (!res.ok) return "Could not cancel message";

    setPending((prev) => prev.filter((m) => m.id !== id));
    return null;
  };

  return { pending, loaded, schedule, cancel };
}