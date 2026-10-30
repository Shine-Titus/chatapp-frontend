import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { request } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loginError, setLoginError] = useState("");

  // are we already signed in? (cookie session)
  useEffect(() => {
    request("/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then(setCurrentUser)
      .catch(() => setCurrentUser(null))
      .finally(() => setAuthChecked(true));
  }, []);

  const login = useCallback(async (username, password) => {
    setLoginError("");
    try {
      const res = await request("/auth/login", { method: "POST", body: { username, password } });

      if (res.status === 401) return setLoginError("Invalid username or password");
      if (!res.ok) return setLoginError("Something went wrong. Try again.");

      const me = await request("/auth/me");
      setCurrentUser(await me.json());
    } catch {
      setLoginError("Cannot reach the server");
    }
  }, []);

  // Drops the user. Everything under <RequireAuth> unmounts, which resets all
  // per-session state (conversations, tags, socket, filters...) automatically.
  const endSession = useCallback((message = "Your session ended. Please sign in again.") => {
    setLoginError(message);
    setCurrentUser(null);
  }, []);

  const logout = useCallback(async () => {
    await request("/auth/logout", { method: "POST" }).catch(() => { });
    endSession("");
  }, [endSession]);

  const value = useMemo(
    () => ({ currentUser, authChecked, loginError, login, logout, endSession }),
    [currentUser, authChecked, loginError, login, logout, endSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
