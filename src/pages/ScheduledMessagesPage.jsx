import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useScheduledMessages } from "../hooks/useScheduledMessages";
import { formatScheduledAt, toEpochMs, toLocalDateValue } from "../utils/datetime";
import { titleOf } from "../utils/conversation";

// Schedule a message for this conversation + see/cancel the pending ones.
export default function ScheduledMessagesPage() {
  const { conversation } = useOutletContext();
  const navigate = useNavigate();
  const { pending, loaded, schedule, cancel } = useScheduledMessages(conversation.id);

  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");

    if (!content.trim()) return setError("Enter a message");
    if (!date) return setError("Pick a date");
    if (!time) return setError("Pick a time");

    const sendAtMs = toEpochMs(date, time);
    if (Number.isNaN(sendAtMs)) return setError("Pick a valid date and time");
    if (sendAtMs <= Date.now()) return setError("Pick a time in the future");

    const problem = await schedule(content.trim(), sendAtMs);
    if (problem) return setError(problem);

    setContent("");
    setDate("");
    setTime("");
  };

  const handleCancel = async (id) => {
    setError("");
    setError((await cancel(id)) || "");
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>Schedule · {titleOf(conversation)}</h1>
        <button className="switch-button" onClick={() => navigate(`/chats/${conversation.id}`)}>Back</button>
      </div>

      <div className="group-form">
        {error && <p className="login-error">{error}</p>}

        <input
          placeholder="Message to send later"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <input
          type="date"
          value={date}
          min={toLocalDateValue(new Date())}
          onChange={(e) => setDate(e.target.value)}
        />

        <input
          type="time"
          step={60}
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        <button className="create-group-button" onClick={submit}>
          Schedule message
        </button>

        <p className="group-hint">Pending ({pending.length})</p>


        {/* pending message list  */}
        <div className="user-list">
          {loaded && pending.length === 0 && (
            <p className="user-list-empty">No scheduled messages.</p>
          )}

          {pending.map((m) => (
            <div key={m.id} className="user-item member-row">
              <span className="user-name">{m.content}</span>
              <span className="group-hint">{formatScheduledAt(m.sendAt)}</span>
              <button className="danger-button" onClick={() => handleCancel(m.id)}>Cancel</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}