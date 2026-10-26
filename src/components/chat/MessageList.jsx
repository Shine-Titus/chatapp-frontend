function MessageList({ messages, currentUser, messageEndRef }) {
  return (
    <div className="messages">

      {messages.map((message) => (
        <div
          key={message.id}
          id={`msg-${message.id}`}
          data-message-id={message.id}
          className={`message ${message.senderId === currentUser.id ? "message-you" : "message-other"}`}
        >
          <strong>{message.senderId === currentUser.id ? "You" : message.senderUsername}</strong>
          <p>
            {message.content}
            <span className={`message ${message.senderId === currentUser.id ? "message-time-you" : "message-time-other"}`}>
              {new Date(message.createdAt).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          </p>

        </div>
      ))}
      <div ref={messageEndRef} />
    </div>
  );
}

export default MessageList;
