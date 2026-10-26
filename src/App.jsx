import { useEffect, useState, useRef } from 'react';
import { Client } from "@stomp/stompjs";

import "./styles/app.css"
import Login from "./auth/login.jsx"
import Register from "./auth/register.jsx"
import { loadRecent, addRecent } from './utils/recentSearches.js';

import { API } from "./config.js";
import { titleOf } from "./utils/titleOf.js";

import UsersScreen from "./components/screens/UsersScreen.jsx";
import NewGroupScreen from "./components/screens/NewGroupScreen.jsx";
import MembersScreen from "./components/screens/MembersScreen.jsx";
import AddMembersScreen from "./components/screens/AddMembersScreen.jsx";
import TagsScreen from "./components/screens/TagsScreen.jsx";
import ChatTagsScreen from "./components/screens/ChatTagsScreen.jsx";
import ChatScreen from "./components/screens/ChatScreen.jsx";
import HomeScreen from "./components/screens/HomeScreen.jsx";

function App() {

  // auth
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setauthChecked] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  // navigation
  const [screen, setScreen] = useState("home");

  // data
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [members, setMembers] = useState([]);

  // searching 
  const [query, setQuery] = useState("");

  // search history for hom
  const [recent, setRecent] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);

  // filter chats
  const [filter, setFilter] = useState("all");


  // search messages in chat
  const [showSearch, setShowSearch] = useState(false);
  const [chatSearchFocused, setChatSearchFocused] = useState(false);

  // scroll search in chat
  const [chatQuery, setChatQuery] = useState("");
  const [matchingMessages, setMatchingMessages] = useState([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(null);

  // search history for chats
  const [chatRecent, setChatRecent] = useState([]);

  // forms
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [groupMembers, setGroupMembers] = useState(new Set());
  const [groupError, setGroupError] = useState("");
  const [addSelection, setAddSelection] = useState(new Set());
  const [actionError, setActionError] = useState("");

  const [tags, setTags] = useState([]);
  const [activeTags, setActiveTags] = useState(new Set());
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState("#2563eb");
  const [tagError, setTagError] = useState("");

  // universal search
  const [messageHits, setMessageHits] = useState([]);
  const [searching, setSearching] = useState(false);

  const stompClientRef = useRef(null);
  const selectedConversationRef = useRef(null);
  const messageEndRef = useRef(null);
  const conversationsRef = useRef([]);
  const pendingJumpRef = useRef(null);

  // derived values
  const isActive = selectedConversation ? selectedConversation.isActive !== false : false;
  const isAdmin = members.some((m) => m.id === currentUser?.id && m.role === "ADMIN");

  // variables
  const homeKey = currentUser ? `recent:home:${currentUser.id}` : null;
  const chatKey = currentUser && selectedConversation ? `recent:chat:${currentUser.id}:${selectedConversation.id}` : null;

  const resetState = (message = "") => {
    setCurrentUser(null);
    setLoginError(message);
    setScreen("home");
    setUsers([]);
    setConversations([]);
    setSelectedConversation(null);
    setMessages([]);
    setMembers([]);
    setOnlineUsers(new Set());
    setGroupName("");
    setGroupMembers(new Set());
    setGroupError("");
    setAddSelection(new Set());
    setActionError("");
    setMessageText("");
    setFilter("all");
    setRecent([]);
    setSearchFocused(false);
    setQuery("");
    setTags([]);
    setActiveTags(new Set());
    setTagName("");
    setTagError("");
  };

  const sessionEnded = () => resetState("Your session ended. Please sign in again.");

  // effects

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  // check if user authourized
  useEffect(() => {
    fetch(`${API}/auth/me`, { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then(setCurrentUser)
      .catch(() => setCurrentUser(null))
      .finally(() => setauthChecked(true));
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    fetch(`${API}/users/online`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => setOnlineUsers(new Set(list)))
      .catch(() => { });
  }, [currentUser]);

  // show users to add
  useEffect(() => {
    if (!currentUser) return;
    if (screen !== "users" && screen !== "newGroup" && screen != "addMembers") return;

    fetch(`${API}/users/users`, { credentials: "include" })
      .then((response) => {
        if (response.status === 403) {
          sessionEnded();
          throw new Error("Session ended");
        }
        return response.json()
      })
      .then(setUsers)
      .catch(() => { })

  }, [screen, currentUser]);

  // show conversations
  useEffect(() => {
    if (!currentUser || screen != "home") return;

    fetch(`${API}/conversations`, { credentials: "include" })
      .then((response) => {
        if (response.status === 403) {
          sessionEnded();
          throw new Error("Session ended");
        }
        return response.json()
      })
      .then(setConversations)
      .catch(() => { })

  }, [screen, currentUser]);

  // fetch tags
  useEffect(() => {
    if (!currentUser || screen !== "home") return;

    fetch(`${API}/tags`, { credentials: "include" })
      .then((r) => {
        if (r.status === 403) {
          sessionEnded();
          throw new Error("Session ended");
        }
        return r.ok ? r.json() : [];
      })
      .then((data) => setTags(Array.isArray(data) ? data : []))
      .catch(() => { });
  }, [screen, currentUser]);

  // fetch history messages
  useEffect(() => {
    if (!selectedConversation) return;

    fetch(`${API}/conversations/${selectedConversation.id}/messages`, { credentials: "include" })
      .then((response) => {
        if (response.status === 403) {
          sessionEnded();
          throw new Error("Session ended");
        }
        return response.json()
      })
      .then(setMessages)
      .catch(() => { })

  }, [selectedConversation?.id]);

  useEffect(() => {

    if (!searching || query.trim().length < 2) {
      setMessageHits([]);
      return;
    }

    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
      fetch(`${API}/search?q=${encodeURIComponent(query)}`, { credentials: "include", signal: controller.signal })
        .then((response) => {
          if (response.status === 403) {
            sessionEnded();
            throw new Error("Session ended");
          }
          return response.json()
        })
        .then(setMessageHits)
        .catch(error => {
          if (error.name === "AbortError") {
            console.log("Fetch request successfully cancelled!");
          } else {
            console.error("A real network error occurred:", error);
          }
        });
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };

  }, [searching, query]);

  useEffect(() => {
    if (screen !== "chat") return;

    const id = pendingJumpRef.current;

    if (id) {
      const el = document.getElementById(`msg-${id}`);
      if (el) {
        el.scrollIntoView({ block: "center" });
        pendingJumpRef.current = null;
        return;
      }
      if (messages.length === 0) return;
      pendingJumpRef.current = null;
    }

    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, screen]);

  useEffect(() => {
    if (screen !== "members" || !selectedConversation) return;
    setActionError("");
    loadMembers(selectedConversation.id);
  }, [screen]);


  useEffect(() => { conversationsRef.current = conversations }, [conversations]);

  useEffect(() => {
    if (!homeKey) {
      setRecent([]);
      return;
    }
    setRecent(loadRecent(homeKey));
  }, [homeKey]);

  useEffect(() => {
    setChatRecent(chatKey ? loadRecent(chatKey) : []);
  }, [chatKey]);

  // runs when the user wants to navigate between searches in chat screen
  useEffect(() => {
    if (matchingMessages.length === 0) return;

    const selectedMessage = matchingMessages[currentMessageIndex];
    if (!selectedMessage) return;

    const messageElement = document.querySelector(
      `[data-message-id="${selectedMessage.id}"]`
    );

    if (!messageElement) return;

    messageElement.scrollIntoView({
      behavior: "smooth",
      block: "center"
    })

    messageElement.classList.add("active-search-match");

    const timeout = setTimeout(() => {
      messageElement.classList.remove("active-search-match");
    }, 400);

    return () => clearTimeout(timeout);


  }, [currentMessageIndex, matchingMessages])

  useEffect(() => {
    if (!currentUser) return;

    const client = new Client({
      brokerURL: "ws://localhost:8080/ws",

      onConnect: () => {
        console.log("STOMP connected");

        client.subscribe("/user/queue/messages", (message) => {
          const newMessage = JSON.parse(message.body);
          const open = selectedConversationRef.current;
          const fromMe = newMessage.senderId === currentUser.id;

          // inside the conversation (mark immediately)
          if (open && newMessage.conversationId === open.id) {
            setMessages((prev) => prev.some((m) => m.id === newMessage.id) ? prev : [...prev, newMessage]);

            if (!fromMe) markRead(open.id);
            return;
          }

          // not inside conversation but known
          const known = conversationsRef.current.some((c) => c.id === newMessage.conversationId);
          if (known) {
            setConversations((prev) =>
              prev.map((c) =>
                c.id === newMessage.conversationId
                  ? { ...c, unreadCount: (c.unreadCount || 0) + 1 }
                  : c
              )
            );
          } else {
            refreshConversations();                  // brand new chat or group
          }
        });

        client.subscribe("/user/queue/kicked", () => {
          setLoginError("You were signed out because you signed in elsewhere.");
          setCurrentUser(null);
          setUsers([]);
          setMessages([]);
        });

        client.subscribe("/topic/presence", (frame) => {
          const { username, online } = JSON.parse(frame.body);

          setOnlineUsers((prev) => {
            const next = new Set(prev);
            if (online) next.add(username);
            else next.delete(username);
            return next;
          });
        });

      },

      onDisconnect: () => {
        console.log("STOMP disconnected");
      },

      onStompError: (frame) => {
        console.error("STOMP error:", frame);
      },
    });

    client.activate();

    stompClientRef.current = client;

    return () => {
      client.deactivate();
      stompClientRef.current = null;
    };
  }, [currentUser]);

  // functions / actions

  const handleLogin = async (username, password) => {
    setLoginError("");
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.status === 401) return setLoginError("Invalid username or password");
      if (!res.ok) return setLoginError("Something went wrong. Try again.");

      const me = await fetch(`${API}/auth/me`, { credentials: "include" });
      setCurrentUser(await me.json());
    } catch {
      setLoginError("Cannot reach the server");
    }
  };

  const handleLogout = async () => {
    await fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" });
    resetState("");
  }

  const goBack = () => {
    setMessages([]);
    setSelectedConversation(null);
    setMembers([]);
    setShowSearch(false);
    setChatQuery("");
    setScreen("home");
  }

  const openConversation = (conversation) => {
    setMessages([]);
    setSelectedConversation(conversation);
    setScreen("chat");
    if (conversation.id) markRead(conversation.id);
  }

  const refreshConversations = () => {
    fetch(`${API}/conversations`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setConversations(Array.isArray(data) ? data : []))
      .catch(() => { });
  };

  const createDirectConversation = async (userId) => {

    const res = await fetch(`${API}/conversations/direct`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ "userId": userId }),
    });

    if (res.status === 403) { return sessionEnded(); }
    if (!res.ok) return console.error("Could not open chat", res.status);

    openConversation(await res.json());
  }

  const loadMembers = async (conversationId) => {
    const res = await fetch(`${API}/conversations/${conversationId}/members`, {
      credentials: "include",
    }).catch(() => null);

    if (!res) return;
    if (res.status === 403) return sessionEnded();
    if (res.status === 404) {
      setSelectedConversation(null);
      setScreen("home");
      return;
    }
    if (!res.ok) return;

    const data = await res.json();
    setMembers(Array.isArray(data) ? data : []);
  }

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || !isActive) return;

    const client = stompClientRef.current;
    if (!client || !client.connected) {
      console.log("STOMP not connected");
      return;
    }

    client.publish({
      destination: "/app/chat",
      body: JSON.stringify({
        conversationId: selectedConversation.id,
        content: messageText,
      }),
    });

    setMessageText("");
  };

  //new group

  const toggleMember = (id) => {
    setGroupMembers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const createGroup = async () => {
    setGroupError("");

    if (!groupName.trim()) return setGroupError("Enter a group name");
    if (groupMembers.size < 1) return setGroupError("Pick at least one member");

    const res = await fetch(`${API}/conversations`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: groupName.trim(),
        description: groupDesc.trim(),
        participantIds: [...groupMembers],
      }),
    });

    if (res.status === 403) {
      setCurrentUser(null);
      setLoginError("Your session ended. Please sign in again.");
      return;
    }
    if (!res.ok) return setGroupError("Could not create group");

    const group = await res.json();
    setGroupName("");
    setGroupMembers(new Set());
    setSelectedConversation(group);
    setScreen("chat");
  };

  const cancelGroup = () => {
    setGroupName("");
    setGroupMembers(new Set());
    setGroupError("");
    setScreen("home");
  };

  // admin -> add or remove members
  const removeMember = async (userId) => {
    setActionError("");

    const res = await fetch(`${API}/conversations/${selectedConversation.id}/participants`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantUserIds: [userId] })
    });

    if (res.status === 403) return setActionError("Only admins can remove members");
    if (!res.ok) return setActionError("Could not remove member");

    loadMembers(selectedConversation.id);
  };

  const toggleAddSelection = (id) => {
    setAddSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addMembers = async () => {
    setActionError("");
    if (addSelection.size < 1) return setActionError("Pick at least one user");

    const res = await fetch(`${API}/conversations/${selectedConversation.id}/participants`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantUserIds: [...addSelection] }),
    });

    if (res.status === 403) return setActionError("Only admins can add members");
    if (!res.ok) return setActionError("Could not add members");

    setAddSelection(new Set());
    await loadMembers(selectedConversation.id);
    setScreen("members");
  };

  const markRead = (conversationId) => {
    fetch(`${API}/conversations/${conversationId}/read`, {
      method: "POST",
      credentials: "include"
    }).catch(() => { })

    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
  }

  // functions for tags
  const createTag = async () => {
    setTagError("");
    if (!tagName.trim()) return setTagError("Enter a tag name");

    const res = await fetch(`${API}/tags`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: tagName.trim(), color: tagColor }),
    });

    if (res.status === 403) return sessionEnded();
    if (res.status === 409) return setTagError("Tag already exists");
    if (!res.ok) return setTagError("Could not create tag");

    const tag = await res.json();
    setTags((prev) => [...prev, tag]);
    setTagName("");
  };

  const removeFromTags = (id) => {
    setActiveTags((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    })
  }

  const addToTags = (id) => {
    setActiveTags((prev) => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    })
  }

  const deleteTag = async (tagId) => {
    const res = await fetch(`${API}/tags/${tagId}`, { method: "DELETE", credentials: "include" });
    if (res.status === 403) return sessionEnded();
    if (!res.ok) return setTagError("Could not delete tag");

    setTags((prev) => prev.filter((t) => t.id !== tagId));
    removeFromTags(tagId);
  };

  // attach or detach one conversation; the server returns the updated tag
  const toggleConversationTag = async (tag, conversationId) => {
    setTagError("");
    const has = (tag.conversationIds || []).includes(conversationId);

    const res = await fetch(
      has
        ? `${API}/tags/${tag.id}/conversations/${conversationId}`
        : `${API}/tags/${tag.id}/conversations`,
      {
        method: has ? "DELETE" : "POST",
        credentials: "include",
        headers: has ? undefined : { "Content-Type": "application/json" },
        body: has ? undefined : JSON.stringify({ conversationIds: [conversationId] }),
      }
    );

    if (res.status === 403) return sessionEnded();
    if (!res.ok) return setTagError("Could not update tag");

    const updated = await res.json();
    setTags((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));

  };

  const tagsByConversation = {};
  tags.forEach((t) => {
    (t.conversationIds || []).forEach((cid) => {
      (tagsByConversation[cid] ||= []).push(t);
    });
  });

  const raw = query.trim().toLowerCase();
  const isTagSearch = raw.startsWith("#");
  const homeTerm = isTagSearch ? raw.slice(1) : raw;

  // filter by tag
  const matchesTab = (c) => {
    if (filter === "unread") return c.unreadCount > 0;
    if (filter === "direct") return c.type === "DIRECT";
    if (filter === "group") return c.type === "GROUP";
    return true;
  };

  // used to filter tags
  const matchesTag = (c) =>
    activeTags.size === 0 || (tagsByConversation[c.id] || []).some((t) => activeTags.has(t.id));


  // used to filter by text
  const matchesText = (c) =>
    // isTagSearch
    //   ? (tagsByConversation[c.id] || []).some((t) => t.name.toLowerCase().startsWith(homeTerm))
    //   : (titleOf(c) || "").toLowerCase().includes(homeTerm);
    (titleOf(c) || "").toLowerCase().includes(homeTerm);

  const filteredConversations = conversations.filter(
    (c) => matchesTab(c) && matchesTag(c) && matchesText(c)
  );

  // unread messages
  const unreadTotal = conversations.filter((c) => c.unreadCount > 0).length;

  // in chat filtering and searching
  const visibleMessages = chatQuery.trim()
    ? messages.filter((m) =>
      (m.content || "").toLowerCase().includes(chatQuery.trim().toLowerCase()))
    : messages;

  // scroll to search feature for in chat
  const addChatSearchResults = (visibleMessages) => {
    setMatchingMessages(visibleMessages);
    if (matchingMessages.length > 0) {
      setCurrentMessageIndex(0);
    }
  }

  useEffect(() => {
    addChatSearchResults(visibleMessages);
  }, [chatQuery])

  // addChatSearchResults(visibleMessages);

  const saveHomeSearch = () => {
    if (!homeKey) return;
    setRecent(addRecent(homeKey, query));
  }

  const saveChatSearch = () => {
    if (!chatKey) return;
    setChatRecent(addRecent(chatKey, chatQuery));
  };

  // screens

  if (!authChecked) return null;

  if (!currentUser) {
    return showRegister
      ? <Register onBack={() => setShowRegister(false)} />
      : <Login onLogin={handleLogin} error={loginError} onShowRegister={() => setShowRegister(true)} />;
  }

  // users list after clicking new chat
  if (screen == "users") {
    return (
      <UsersScreen
        currentUser={currentUser}
        users={users}
        onlineUsers={onlineUsers}
        setScreen={setScreen}
        handleLogout={handleLogout}
        createDirectConversation={createDirectConversation}
      />
    );
  }

  if (screen === "newGroup") {
    return (
      <NewGroupScreen
        cancelGroup={cancelGroup}
        groupError={groupError}
        groupName={groupName}
        setGroupName={setGroupName}
        groupDesc={groupDesc}
        setGroupDesc={setGroupDesc}
        groupMembers={groupMembers}
        users={users}
        toggleMember={toggleMember}
        createGroup={createGroup}
      />
    );
  }

  if (screen === "members" && selectedConversation) {
    return (
      <MembersScreen
        selectedConversation={selectedConversation}
        isAdmin={isAdmin}
        setActionError={setActionError}
        setScreen={setScreen}
        actionError={actionError}
        members={members}
        onlineUsers={onlineUsers}
        currentUser={currentUser}
        removeMember={removeMember}
      />
    );
  };

  if (screen === "addMembers" && selectedConversation) {
    return (
      <AddMembersScreen
        users={users}
        members={members}
        selectedConversation={selectedConversation}
        setAddSelection={setAddSelection}
        setScreen={setScreen}
        actionError={actionError}
        addSelection={addSelection}
        toggleAddSelection={toggleAddSelection}
        addMembers={addMembers}
      />
    );
  }

  if (screen === "tags") {
    return (
      <TagsScreen
        setTagError={setTagError}
        setScreen={setScreen}
        tagError={tagError}
        tagName={tagName}
        setTagName={setTagName}
        tagColor={tagColor}
        setTagColor={setTagColor}
        createTag={createTag}
        tags={tags}
        deleteTag={deleteTag}
      />
    );
  }

  if (screen === "chatTags" && selectedConversation) {
    return (
      <ChatTagsScreen
        selectedConversation={selectedConversation}
        setTagError={setTagError}
        setScreen={setScreen}
        tagError={tagError}
        tags={tags}
        toggleConversationTag={toggleConversationTag}
      />
    );
  }

  if (screen === "chat" && selectedConversation) {
    return (
      <ChatScreen
        selectedConversation={selectedConversation}
        onlineUsers={onlineUsers}
        isActive={isActive}
        setScreen={setScreen}
        setShowSearch={setShowSearch}
        goBack={goBack}
        showSearch={showSearch}
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
        messages={messages}
        currentUser={currentUser}
        messageEndRef={messageEndRef}
        messageText={messageText}
        setMessageText={setMessageText}
        sendMessage={sendMessage}
      />
    );
  }

  return (
    <HomeScreen
      currentUser={currentUser}
      setScreen={setScreen}
      handleLogout={handleLogout}
      conversations={conversations}
      tagsByConversation={tagsByConversation}
      filter={filter}
      setFilter={setFilter}
      unreadTotal={unreadTotal}
      tags={tags}
      activeTags={activeTags}
      removeFromTags={removeFromTags}
      addToTags={addToTags}
      query={query}
      setQuery={setQuery}
      setSearchFocused={setSearchFocused}
      setSearching={setSearching}
      saveHomeSearch={saveHomeSearch}
      searchFocused={searchFocused}
      recent={recent}
      setRecent={setRecent}
      homeKey={homeKey}
      filteredConversations={filteredConversations}
      onlineUsers={onlineUsers}
      openConversation={openConversation}
      messageHits={messageHits}
      pendingJumpRef={pendingJumpRef}
    />
  );
}


export default App;
