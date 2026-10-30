export const titleOf = (c) => (c.type === "DIRECT" ? c.otherUsername : c.name);

// The list endpoint uses `active`, other payloads used `isActive`; honour both.
export const isConversationActive = (c) => c.isActive !== false && c.active !== false;
