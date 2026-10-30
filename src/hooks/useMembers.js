import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { request } from "../api";
import { useAuth } from "../context/AuthContext";

// Members of one group + admin actions. `conversationId` is the route param.
// Actions return an error string (or null on success) so pages can show it.
export function useMembers(conversationId) {
  const { currentUser, endSession } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const res = await request(`/conversations/${conversationId}/members`).catch(() => null);

    if (!res) return;
    if (res.status === 403) return endSession();
    if (res.status === 404) {
      navigate("/", { replace: true });
      return;
    }
    if (!res.ok) return;

    const data = await res.json();
    setMembers(Array.isArray(data) ? data : []);
    setLoaded(true);
  }, [conversationId, endSession, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const isAdmin = members.some((m) => m.id === currentUser.id && m.role === "ADMIN");

  const removeMember = async (userId) => {
    const res = await request(`/conversations/${conversationId}/participants`, {
      method: "DELETE",
      body: { participantUserIds: [userId] },
    });

    if (res.status === 403) return "Only admins can remove members";
    if (!res.ok) return "Could not remove member";

    await load();
    return null;
  };

  const addMembers = async (userIds) => {
    if (userIds.length < 1) return "Pick at least one user";

    const res = await request(`/conversations/${conversationId}/participants`, {
      method: "POST",
      body: { participantUserIds: userIds },
    });

    if (res.status === 403) return "Only admins can add members";
    if (!res.ok) return "Could not add members";

    return null;
  };

  return { members, loaded, isAdmin, removeMember, addMembers };
}
