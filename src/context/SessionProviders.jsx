import { SocketProvider } from "./SocketContext";
import { PresenceProvider } from "./PresenceContext";
import { ConversationsProvider } from "./ConversationsContext";
import { TagsProvider } from "./TagsContext";
import { InboxFilterProvider } from "./InboxFilterContext";
import KickListener from "../components/KickListener";

// Everything that only exists while someone is signed in.
// Order matters: each provider may use the ones above it.
export default function SessionProviders({ children }) {
  return (
    <SocketProvider>
      <PresenceProvider>
        <ConversationsProvider>
          <TagsProvider>
            <InboxFilterProvider>
              <KickListener />
              {children}
            </InboxFilterProvider>
          </TagsProvider>
        </ConversationsProvider>
      </PresenceProvider>
    </SocketProvider>
  );
}
