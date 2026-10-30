import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useConversations } from "../context/ConversationsContext";
import { usePresence } from "../context/PresenceContext";
import { useMessages } from "../hooks/useMessages";
import { useChatSearch } from "../hooks/useChatSearch";
import { useRecentSearches } from "../hooks/useRecentSearches";
import { isConversationActive, titleOf } from "../utils/conversation";
import ChatSearchBar from "../components/chat/ChatSearchBar";
import MessageList from "../components/chat/MessageList";
import MessageInput from "../components/chat/MessageInput";

export default function ChatPage() {
  const { conversation } = useOutletContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { isOnline } = usePresence();
  const { markRead } = useConversations();

  const { messages, sendMessage } = useMessages(conversation.id);
  const search = useChatSearch(messages);
  const recent = useRecentSearches(`recent:chat:${currentUser.id}:${conversation.id}`);

  const [messageText, setMessageText] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const messageEndRef = useRef(null);
  // set when we arrived from a search hit on the home screen
  const pendingJumpRef = useRef(location.state?.jumpTo ?? null);

  const isActive = isConversationActive(conversation);

  // opening the chat = reading it
  useEffect(() => {
    markRead(conversation.id);
  }, [conversation.id, markRead]);

  // jump to the searched message once it's rendered, otherwise stick to the bottom
  useEffect(() => {
    const id = pendingJumpRef.current;

    if (id) {
      const el = document.getElementById(`msg-${id}`);
      if (el) {
        el.scrollIntoView({ block: "center" });
        pendingJumpRef.current = null;
        return;
      }
      if (messages.length === 0) return;
      pendingJumpRef.current = null;
    }

    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!messageText.trim() || !isActive) return;
    if (sendMessage(messageText)) setMessageText("");
  };

  const closeSearch = () => {
    setShowSearch(false);
    search.setQuery("");
  };

  const base = `/chats/${conversation.id}`;

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-left">
          <h1>{titleOf(conversation)}</h1>
          {conversation.type === "DIRECT" && (
            <span className={`status-dot ${isOnline(conversation.otherUsername) ? "online" : "offline"}`} />
          )}
        </div>

        <div className="header-actions">
          <button className="switch-button" onClick={() => navigate(`${base}/tags`)}>Tags</button>
          <button className="switch-button" onClick={() => setShowSearch(true)}>Search</button>
          {conversation.type === "GROUP" && isActive && (
            <button className="switch-button" onClick={() => navigate(`${base}/members`)}>Members</button>
          )}
          <button className="switch-button" onClick={() => navigate("/")}>Back</button>
        </div>
      </div>

      {showSearch && <ChatSearchBar search={search} recent={recent} onClose={closeSearch} />}

      <MessageList messages={messages} currentUserId={currentUser.id} endRef={messageEndRef} />

      <MessageInput
        isActive={isActive}
        value={messageText}
        onChange={setMessageText}
        onSend={handleSend}
      />
    </div>
  );
}
