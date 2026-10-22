import { useEffect, useState, useRef } from 'react';
import { Client } from "@stomp/stompjs";
import "./app.css"
import Login from "./login.jsx"
import Register from "./register.jsx"
import { loadRecent, removeRecent, addRecent, clearRecent } from './recentSearches.js';

const API = "http://localhost:8080";

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

  // search history
  const [recent, setRecent] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);

  // filter chats
  const [filter, setFilter] = useState("all");

  // search messages in chat
  const [showSearch, setShowSearch] = useState(false);
  const [chatQuery, setChatQuery] = useState("");
  const [chatRecent, setChatRecent] = useState([]);
  const [chatSearchFocused, setChatSearchFocused] = useState(false);

  // forms
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [groupMembers, setGroupMembers] = useState(new Set());
  const [groupError, setGroupError] = useState("");
  const [addSelection, setAddSelection] = useState(new Set());
  const [actionError, setActionError] = useState("");

  const [tags, setTags] = useState([]);
  const [activeTag, setActiveTag] = useState(null);
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState("#2563eb");
  const [tagError, setTagError] = useState("");

  const stompClientRef = useRef(null);
  const selectedConversationRef = useRef(null);
  const messageEndRef = useRef(null);
  const conversationsRef = useRef([]);

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
    setActiveTag(null);
    setTagName("");
    setTagError("");
  };

  const sessionEnded = () => resetState("Your session ended. Please sign in again.");

  const titleOf = (c) => (c.type === "DIRECT" ? c.otherUsername : c.name);


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

  useEffect(() => {
    if (screen !== "members" || !selectedConversation) return;
    setActionError("");
    loadMembers(selectedConversation.id);
  }, [screen]);

  // keep newest message in view
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, screen]);

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
  };

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

  const deleteTag = async (tagId) => {
    const res = await fetch(`${API}/tags/${tagId}`, { method: "DELETE", credentials: "include" });
    if (res.status === 403) return sessionEnded();
    if (!res.ok) return setTagError("Could not delete tag");

    setTags((prev) => prev.filter((t) => t.id !== tagId));
    if (activeTag === tagId) setActiveTag(null);
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

  // tabs
  const tagsByConversation = {};
  tags.forEach((t) => {
    (t.conversationIds || []).forEach((cid) => {
      (tagsByConversation[cid] ||= []).push(t);
    });
  });

  const raw = query.trim().toLowerCase();
  const isTagSearch = raw.startsWith("#");
  const homeTerm = isTagSearch ? raw.slice(1) : raw;

  const matchesTab = (c) => {
    if (filter === "unread") return c.unreadCount > 0;
    if (filter === "direct") return c.type === "DIRECT";
    if (filter === "group") return c.type === "GROUP";
    return true;
  };

  const matchesTag = (c) =>
    activeTag === null || (tagsByConversation[c.id] || []).some((t) => t.id === activeTag);

  const matchesText = (c) =>
    isTagSearch
      ? (tagsByConversation[c.id] || []).some((t) => t.name.toLowerCase().startsWith(homeTerm))
      : (titleOf(c) || "").toLowerCase().includes(homeTerm);

  const filteredConversations = conversations.filter(
    (c) => matchesTab(c) && matchesTag(c) && matchesText(c)
  );

  // unread messages

  const unreadTotal = conversations.filter((c) => c.unreadCount > 0).length;

  const visibleMessages = chatQuery.trim()
    ? messages.filter((m) =>
      (m.content || "").toLowerCase().includes(chatQuery.trim().toLowerCase()))
    : messages;

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
      <div className="chat-container">
        <div className="chat-header">
          <h1>All Users, {currentUser.username}</h1>
          <button className="switch-button" onClick={() => setScreen("home")}>Back</button>
          <button className="switch-button" onClick={handleLogout}>Logout</button>
        </div>

        <div className="user-list">
          {users.length === 0 && <p className="user-list-empty">No other users yet.</p>}

          {users.map((user) => (
            <button key={user.id} className="user-item" onClick={() => createDirectConversation(user.id)}>
              <span className={`status-dot ${onlineUsers.has(user.username) ? "online" : "offline"}`} />
              <span className="user-name">{user.username}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (screen === "newGroup") {
    return (
      <div className="chat-container">
        <div className="chat-header">
          <h1>New group</h1>
          <button className="switch-button" onClick={cancelGroup}>Back</button>
        </div>

        <div className="group-form">
          {groupError && <p className="login-error">{groupError}</p>}

          <input
            placeholder="Group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />

          <input
            placeholder="Group description"
            value={groupDesc}
            onChange={(e) => setGroupDesc(e.target.value)}
          />

          <p className="group-hint">Select members ({groupMembers.size})</p>

          <div className="user-list">
            {users.map((user) => (
              <label key={user.id} className="user-item">
                <input
                  type="checkbox"
                  checked={groupMembers.has(user.id)}
                  onChange={() => toggleMember(user.id)}
                />
                <span className="user-name">{user.username}</span>
              </label>
            ))}
          </div>

          <button className="create-group-button" onClick={createGroup}>
            Create group
          </button>
        </div>
      </div>
    );
  }

  if (screen === "members" && selectedConversation) {
    return (
      <div className="chat-container">
        <div className="chat-header">
          <h1>{selectedConversation.name} · members</h1>
          <div className="header-actions">
            {isAdmin && (
              <button className="switch-button" onClick={() => { setActionError(""); setScreen("addMembers"); }}>
                Add
              </button>
            )}
            <button className="switch-button" onClick={() => setScreen("chat")}>Back</button>
          </div>
        </div>

        <div className="group-info">
          <h2 className="group-info-title">About this group</h2>

          <p className="group-info-description">
            {selectedConversation.description || "No description yet."}
          </p>

          {selectedConversation.createdAt && (
            <p className="group-info-meta">
              Created {new Date(selectedConversation.createdAt).toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          )}
        </div>

        <div className="group-form">
          {actionError && <p className="login-error">{actionError}</p>}

          <div className="user-list">
            {members.map((member) => (
              <div key={member.id} className="user-item member-row">
                <span className={`status-dot ${onlineUsers.has(member.username) ? "online" : "offline"}`} />
                <span className="user-name">
                  {member.username}
                  {member.id === currentUser.id ? " (you)" : ""}
                </span>
                {member.role === "ADMIN" && <span className="badge">Admin</span>}
                {isAdmin && member.id !== currentUser.id && (
                  <button className="danger-button" onClick={() => removeMember(member.id)}>
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (screen === "addMembers" && selectedConversation) {
    const candidates = users.filter((u) => !members.some((m) => m.id === u.id));

    return (
      <div className="chat-container">
        <div className="chat-header">
          <h1>Add to {selectedConversation.name}</h1>
          <button className="switch-button" onClick={() => { setAddSelection(new Set()); setScreen("members"); }}>
            Back
          </button>
        </div>

        <div className="group-form">
          {actionError && <p className="login-error">{actionError}</p>}

          <p className="group-hint">Select users ({addSelection.size})</p>

          <div className="user-list">
            {candidates.length === 0 && <p className="user-list-empty">Everyone is already in this group.</p>}

            {candidates.map((user) => (
              <label key={user.id} className="user-item">
                <input
                  type="checkbox"
                  checked={addSelection.has(user.id)}
                  onChange={() => toggleAddSelection(user.id)}
                />
                <span className="user-name">{user.username}</span>
              </label>
            ))}
          </div>

          <button className="create-group-button" onClick={addMembers}>
            Add selected
          </button>
        </div>
      </div>
    );
  }

  if (screen === "tags") {
    return (
      <div className="chat-container">
        <div className="chat-header">
          <h1>My tags</h1>
          <button className="switch-button" onClick={() => { setTagError(""); setScreen("home"); }}>Back</button>
        </div>

        <div className="group-form">
          {tagError && <p className="login-error">{tagError}</p>}

          <div className="tag-create">
            <input
              placeholder="New tag name"
              value={tagName}
              maxLength={30}
              onChange={(e) => setTagName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createTag()}
            />
            <input type="color" value={tagColor} onChange={(e) => setTagColor(e.target.value)} />
            <button className="create-group-button" onClick={createTag}>Add</button>
          </div>

          <div className="user-list">
            {tags.length === 0 && <p className="user-list-empty">No tags yet.</p>}
            {tags.map((t) => (
              <div key={t.id} className="user-item member-row">
                <span className="tag-dot" style={{ background: t.color || "#2563eb" }} />
                <span className="user-name">{t.name}</span>
                <span className="group-hint">{(t.conversationIds || []).length} chats</span>
                <button className="danger-button" onClick={() => deleteTag(t.id)}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (screen === "chatTags" && selectedConversation) {
    return (
      <div className="chat-container">
        <div className="chat-header">
          <h1>Tags for {titleOf(selectedConversation)}</h1>
          <button className="switch-button" onClick={() => { setTagError(""); setScreen("chat"); }}>Back</button>
        </div>

        <div className="group-form">
          {tagError && <p className="login-error">{tagError}</p>}

          <div className="user-list">
            {tags.length === 0 && (
              <p className="user-list-empty">
                No tags yet. <button className="link-button" onClick={() => setScreen("tags")}>Create one</button>
              </p>
            )}
            {tags.map((t) => (
              <label key={t.id} className="user-item">
                <input
                  type="checkbox"
                  checked={(t.conversationIds || []).includes(selectedConversation.id)}
                  onChange={() => toggleConversationTag(t, selectedConversation.id)}
                />
                <span className="tag-dot" style={{ background: t.color || "#2563eb" }} />
                <span className="user-name">{t.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (screen === "chat" && selectedConversation) {
    return (
      <div className="chat-container">

        <div className="chat-header">
          <div className="header-left">
            <h1>{titleOf(selectedConversation)}</h1>
            {selectedConversation.type === "DIRECT" && (
              <span
                className={`status-dot ${onlineUsers.has(selectedConversation.otherUsername) ? "online" : "offline"
                  }`}
              />
            )}
          </div>

          <div className="header-actions">
            <button className="switch-button" onClick={() => setScreen("chatTags")}>Tags</button>
            <button className="switch-button" onClick={() => setShowSearch(true)}>Search</button>
            {selectedConversation.type === "GROUP" && isActive && (
              <button className="switch-button" onClick={() => setScreen("members")}>Members</button>
            )}
            <button className="switch-button" onClick={goBack}>Back</button>
          </div>
        </div>

        {showSearch && (
          <div className="chat-search">
            <input
              type="text"
              placeholder="Search in this conversation..."
              value={chatQuery}
              onChange={(e) => setChatQuery(e.target.value)}
              onFocus={() => setChatSearchFocused(true)}
              onBlur={() => { setChatSearchFocused(false); saveChatSearch(); }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  saveChatSearch();
                  nextMatch();
                }
              }}
              autoFocus
            />

            {chatSearchFocused && !chatQuery && chatRecent.length > 0 && (
              <div className="recent-dropdown">
                <div className="recent-header">
                  <span>Recent searches</span>
                  <button
                    className="recent-clear"
                    onMouseDown={(e) => { e.preventDefault(); setChatRecent(clearRecent(chatKey)); }}
                  >
                    Clear all
                  </button>
                </div>

                {chatRecent.map((term) => (
                  <div
                    key={term}
                    className="recent-item"
                    onMouseDown={(e) => { e.preventDefault(); setChatQuery(term); }}
                  >
                    <span className="recent-term">{term}</span>
                    <button
                      className="recent-remove"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setChatRecent(removeRecent(chatKey, term));
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              className="chat-search-close"
              onClick={() => { setShowSearch(false); setChatQuery(""); }}
            >
              ✕
            </button>

          </div>
        )}

        <div className="messages">

          {visibleMessages.map((message) => (
            <div
              key={message.id}
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

        {isActive ? (
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
        ) : (
          <div className="readonly-bar">You were removed from this group</div>
        )}
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>{currentUser.username}</h1>
        <div className="header-actions">
          <button className="switch-button" onClick={() => setScreen("tags")}>Tags</button>
          <button className="switch-button" onClick={() => setScreen("users")}>New chat</button>
          <button className="switch-button" onClick={() => setScreen("newGroup")}>New group</button>
          <button className="switch-button" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <span className="user-name">{titleOf(conversations)}</span>
      {(tagsByConversation[conversations.id] || []).slice(0, 3).map((t) => (
        <span key={t.id} className="tag-chip" style={{ background: t.color || "#2563eb" }}>
          {t.name}
        </span>
      ))}

      <div className="filter-tabs">
        {[
          ["all", "All"],
          ["unread", "Unread"],
          ["direct", "Direct"],
          ["group", "Groups"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={`filter-tab ${filter === key ? "active" : ""}`}
            onClick={() => setFilter(key)}
          >
            {label}
            {key === "unread" && unreadTotal > 0 && (
              <span className="filter-count">{unreadTotal}</span>
            )}
          </button>
        ))}
      </div>

      {tags.length > 0 && (
        <div className="filter-tabs">
          {tags.map((t) => (
            <button
              key={t.id}
              className={`filter-tab ${activeTag === t.id ? "active" : ""}`}
              onClick={() => setActiveTag(activeTag === t.id ? null : t.id)}
            >
              <span className="tag-dot" style={{ background: t.color || "#2563eb" }} />
              {t.name}
            </button>
          ))}
        </div>
      )}

      <div className="search-wrap">
        <input
          className="search"
          type="text"
          placeholder="Search a conversation..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => {
            setSearchFocused(false);
            saveHomeSearch();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              saveHomeSearch();
              e.target.blur();
            }
          }}
        />

        {searchFocused && !query && recent.length > 0 && (
          <div className="recent-dropdown">
            <div className="recent-header">
              <span>Recent searches</span>
              <button
                className="recent-clear"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setRecent(clearRecent(homeKey));
                }}
              >
                Clear all
              </button>
            </div>

            {recent.map((term) => (
              <div
                key={term}
                className="recent-item"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setQuery(term);
                }}
              >
                <span className="recent-term">{term}</span>
                <button
                  className="recent-remove"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setRecent(removeRecent(homeKey, term));
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="user-list">
        {filteredConversations.length === 0 && <p className="user-list-empty">No conversations yet.</p>}

        {filteredConversations.map((conversation) => (
          <button key={conversation.id} className="user-item" onClick={() => openConversation(conversation)}>
            {conversation.type === "DIRECT" && (
              <span
                className={`status-dot ${onlineUsers.has(conversation.otherUsername) ? "online" : "offline"}`}
              />
            )}
            <span className="user-name">{titleOf(conversation)}</span>
            {conversation.unreadCount > 0 && (
              <span className="unread-badge">
                {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
              </span>
            )}
            {conversation.type === "GROUP" && conversation.active === false && (
              <span className="removed-tag">(removed)</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}


export default App;