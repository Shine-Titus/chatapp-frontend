import { useNavigate } from "react-router-dom";
import Login from "../login.jsx";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login, loginError } = useAuth();
  const navigate = useNavigate();

  return <Login onLogin={login} error={loginError} onShowRegister={() => navigate("/register")} />;
}
