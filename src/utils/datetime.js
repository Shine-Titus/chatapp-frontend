const pad = (n) => String(n).padStart(2, "0");

// Date -> "2026-11-12" in LOCAL time (for the date input's min)
export const toLocalDateValue = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// convert local date and time to epochMS or NaN if it fails
export const toEpochMs = (dateStr, timeStr) => new Date(`${dateStr}T${timeStr}`).getTime();

// epoch ms (or ISO string) from the server -> "12 Nov, 06:30 PM"
export const formatScheduledAt = (value) =>
  new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });