import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useConversations } from "../context/ConversationsContext";
import { useInboxFilter } from "../context/InboxFilterContext";
import { useMessageSearch } from "../hooks/useMessageSearch";
import FilterTabs from "../components/home/FilterTabs";
import TagFilter from "../components/home/TagFilter";
import HomeSearchBox from "../components/home/HomeSearchBox";
import ConversationList from "../components/home/ConversationList";
import MessageSearchResults from "../components/home/MessageSearchResults";

export default function HomePage() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { refreshConversations } = useConversations();
  const { query } = useInboxFilter();
  const hits = useMessageSearch(query);

  // coming back to the list: refresh it (new chats, removed groups, unread counts)
  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>{currentUser.username}</h1>
        <div className="header-actions">
          <button className="switch-button" onClick={() => navigate("/tags")}>Tags</button>
          <button className="switch-button" onClick={() => navigate("/users")}>New chat</button>
          <button className="switch-button" onClick={() => navigate("/groups/new")}>New group</button>
          <button className="switch-button" onClick={logout}>Logout</button>
        </div>
      </div>

      <FilterTabs />
      <TagFilter />
      <HomeSearchBox />
      <ConversationList />
      <MessageSearchResults hits={hits} />
    </div>
  );
}
