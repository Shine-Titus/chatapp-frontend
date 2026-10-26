import { titleOf } from "../../utils/titleOf.js";
import ChatSearchBar from "../chat/ChatSearchBar.jsx";
import MessageList from "../chat/MessageList.jsx";
import MessageInput from "../chat/MessageInput.jsx";

function ChatScreen({
  selectedConversation,
  onlineUsers,
  isActive,
  setScreen,
  setShowSearch,
  goBack,
  showSearch,
  chatQuery,
  setChatQuery,
  setChatSearchFocused,
  saveChatSearch,
  setCurrentMessageIndex,
  matchingMessages,
  currentMessageIndex,
  chatSearchFocused,
  chatRecent,
  setChatRecent,
  chatKey,
  messages,
  currentUser,
  messageEndRef,
  messageText,
  setMessageText,
  sendMessage,
}) {
  return (
    <div className="chat-container">

      <div className="chat-header">
        <div className="header-left">
          <h1>{titleOf(selectedConversation)}</h1>
          {selectedConversation.type === "DIRECT" && (
            <span
              className={`status-dot ${onlineUsers.has(selectedConversation.otherUsername) ? "online" : "offline"
                }`}
            />
          )}
        </div>

        <div className="header-actions">
          <button className="switch-button" onClick={() => setScreen("chatTags")}>Tags</button>
          <button className="switch-button" onClick={() => setShowSearch(true)}>Search</button>
          {selectedConversation.type === "GROUP" && isActive && (
            <button className="switch-button" onClick={() => setScreen("members")}>Members</button>
          )}
          <button className="switch-button" onClick={goBack}>Back</button>
        </div>
      </div>

      {showSearch && (
        <ChatSearchBar
          chatQuery={chatQuery}
          setChatQuery={setChatQuery}
          setChatSearchFocused={setChatSearchFocused}
          saveChatSearch={saveChatSearch}
          setCurrentMessageIndex={setCurrentMessageIndex}
          matchingMessages={matchingMessages}
          currentMessageIndex={currentMessageIndex}
          chatSearchFocused={chatSearchFocused}
          chatRecent={chatRecent}
          setChatRecent={setChatRecent}
          chatKey={chatKey}
          setShowSearch={setShowSearch}
        />
      )}

      <MessageList messages={messages} currentUser={currentUser} messageEndRef={messageEndRef} />

      {
        isActive ? (
          <MessageInput
            messageText={messageText}
            setMessageText={setMessageText}
            sendMessage={sendMessage}
          />
        ) : (
          <div className="readonly-bar">You were removed from this group</div>
        )
      }
    </div >
  );
}

export default ChatScreen;
