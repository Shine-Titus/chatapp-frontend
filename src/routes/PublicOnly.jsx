import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Login / register: signed-in users get sent to the app.
export default function PublicOnly() {
  const { currentUser, authChecked } = useAuth();

  if (!authChecked) return null;
  if (currentUser) return <Navigate to="/" replace />;

  return <Outlet />;
}
