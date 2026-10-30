import { useAuth } from "../context/AuthContext";
import { useSocketSubscription } from "../context/SocketContext";

// Signed in somewhere else? The server tells us and we drop the session.
export default function KickListener() {
  const { endSession } = useAuth();

  useSocketSubscription("/user/queue/kicked", () => {
    endSession("You were signed out because you signed in elsewhere.");
  });

  return null;
}
