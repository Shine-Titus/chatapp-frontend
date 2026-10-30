import { useCallback, useState } from "react";

// A Set held in state with toggle/clear helpers (group members, add-members, tag filter).
export function useToggleSet() {
  const [set, setSet] = useState(() => new Set());

  const toggle = useCallback((id) => {
    setSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clear = useCallback(() => setSet(new Set()), []);

  return [set, toggle, clear];
}
