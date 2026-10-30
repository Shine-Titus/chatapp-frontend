import { useEffect, useState } from "react";
import { request } from "../api";
import { useAuth } from "../context/AuthContext";

// Debounced search across all messages (home screen).
export function useMessageSearch(query) {
  const { endSession } = useAuth();
  const [hits, setHits] = useState([]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setHits([]);
      return;
    }

    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
      request(`/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then((res) => {
          if (res.status === 403) {
            endSession();
            return null;
          }
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) setHits(data);
        })
        .catch((error) => {
          if (error.name !== "AbortError") console.error("A real network error occurred:", error);
        });
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query, endSession]);

  return hits;
}
