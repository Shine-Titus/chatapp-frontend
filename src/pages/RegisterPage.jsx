import { useNavigate } from "react-router-dom";
import Register from "../register.jsx";

export default function RegisterPage() {
  const navigate = useNavigate();

  return <Register onBack={() => navigate("/login")} />;
}
