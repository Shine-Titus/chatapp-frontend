import { Fragment } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import { useConversation } from "../context/ConversationsContext";

// Wraps /chats/:conversationId and its sub-pages. Resolves the conversation once and
// hands it to the child page through the Outlet context (useOutletContext()).
export default function ConversationLayout() {
  const { conversationId } = useParams();
  const { conversation, loaded } = useConversation(conversationId);

  if (!conversation) return loaded ? <Navigate to="/" replace /> : null;

  // keyed so switching to another conversation remounts the page with fresh state
  return (
    <Fragment key={conversation.id}>
      <Outlet context={{ conversation }} />
    </Fragment>
  );
}
