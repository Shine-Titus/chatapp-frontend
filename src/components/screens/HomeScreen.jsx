import { titleOf } from "../../utils/titleOf.js";
import FilterTabs from "../home/FilterTabs.jsx";
import TagFilter from "../home/TagFilter.jsx";
import HomeSearch from "../home/HomeSearch.jsx";
import ConversationList from "../home/ConversationList.jsx";
import SearchResults from "../home/SearchResults.jsx";

function HomeScreen({
  currentUser,
  setScreen,
  handleLogout,
  conversations,
  tagsByConversation,
  filter,
  setFilter,
  unreadTotal,
  tags,
  activeTags,
  removeFromTags,
  addToTags,
  query,
  setQuery,
  setSearchFocused,
  setSearching,
  saveHomeSearch,
  searchFocused,
  recent,
  setRecent,
  homeKey,
  filteredConversations,
  onlineUsers,
  openConversation,
  messageHits,
  pendingJumpRef,
}) {
  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>{currentUser.username}</h1>
        <div className="header-actions">
          <button className="switch-button" onClick={() => setScreen("tags")}>Tags</button>
          <button className="switch-button" onClick={() => setScreen("users")}>New chat</button>
          <button className="switch-button" onClick={() => setScreen("newGroup")}>New group</button>
          <button className="switch-button" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <span className="user-name">{titleOf(conversations)}</span>
      {(tagsByConversation[conversations.id] || []).slice(0, 3).map((t) => (
        <span key={t.id} className="tag-chip" style={{ background: t.color || "#2563eb" }}>
          {t.name}
        </span>
      ))}

      <FilterTabs filter={filter} setFilter={setFilter} unreadTotal={unreadTotal} />

      {tags.length > 0 && (
        <TagFilter
          tags={tags}
          activeTags={activeTags}
          removeFromTags={removeFromTags}
          addToTags={addToTags}
        />
      )}

      <HomeSearch
        query={query}
        setQuery={setQuery}
        setSearchFocused={setSearchFocused}
        setSearching={setSearching}
        saveHomeSearch={saveHomeSearch}
        searchFocused={searchFocused}
        recent={recent}
        setRecent={setRecent}
        homeKey={homeKey}
      />

      <ConversationList
        filteredConversations={filteredConversations}
        onlineUsers={onlineUsers}
        openConversation={openConversation}
      />

      <SearchResults
        messageHits={messageHits}
        conversations={conversations}
        openConversation={openConversation}
        pendingJumpRef={pendingJumpRef}
      />

    </div>
  );
}

export default HomeScreen;
