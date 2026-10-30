// Checkbox list of users (new group, add members).
export default function UserCheckList({ users, selected, onToggle, emptyText }) {
  return (
    <div className="user-list">
      {users.length === 0 && emptyText && <p className="user-list-empty">{emptyText}</p>}

      {users.map((user) => (
        <label key={user.id} className="user-item">
          <input
            type="checkbox"
            checked={selected.has(user.id)}
            onChange={() => onToggle(user.id)}
          />
          <span className="user-name">{user.username}</span>
        </label>
      ))}
    </div>
  );
}
