import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SessionProviders from "../context/SessionProviders";

// Guards every signed-in page and mounts the session-scoped providers.
// `key` = user id, so a different user (or a logout) tears everything down and
// the next session starts from a clean slate.
export default function RequireAuth() {
  const { currentUser, authChecked } = useAuth();

  if (!authChecked) return null;
  if (!currentUser) return <Navigate to="/login" replace />;

  return (
    <SessionProviders key={currentUser.id}>
      <Outlet />
    </SessionProviders>
  );
}
