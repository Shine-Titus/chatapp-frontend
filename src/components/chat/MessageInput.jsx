export default function MessageInput({ isActive, value, onChange, onSend }) {
  if (!isActive) {
    return <div className="readonly-bar">You were removed from this group</div>;
  }

  return (
    <div className="message-input">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSend()}
        placeholder="Type a message..."
      />
      <button onClick={onSend}>Send</button>
    </div>
  );
}
