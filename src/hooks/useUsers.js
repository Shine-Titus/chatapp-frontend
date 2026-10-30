import { useEffect, useState } from "react";
import { request } from "../api";
import { useAuth } from "../context/AuthContext";

// All users you can chat with. Fetched whenever the screen using it mounts.
export function useUsers() {
  const { endSession } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let cancelled = false;

    request("/users/users")
      .then((res) => {
        if (res.status === 403) {
          endSession();
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setUsers(data);
      })
      .catch(() => { });

    return () => { cancelled = true; };
  }, [endSession]);

  return users;
}
