function MessageInput({ messageText, setMessageText, sendMessage }) {
  return (
    <div className="message-input">
      <input
        type="text"
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default MessageInput;
