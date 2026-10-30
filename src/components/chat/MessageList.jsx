export default function MessageList({ messages, currentUserId, endRef }) {
  return (
    <div className="messages">
      {messages.map((message) => {
        const mine = message.senderId === currentUserId;

        return (
          <div
            key={message.id}
            id={`msg-${message.id}`}
            data-message-id={message.id}
            className={`message ${mine ? "message-you" : "message-other"}`}
          >
            <strong>{mine ? "You" : message.senderUsername}</strong>
            <p>
              {message.content}
              <span className={`message ${mine ? "message-time-you" : "message-time-other"}`}>
                {new Date(message.createdAt).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
            </p>
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}
