import React, { useState, useEffect, useRef } from "react";
import "./ChatBox.css";

function ChatBox({ selectedUser, messages, sendMessage, currentUser, onlineUsers = [] }) {
  const [text, setText] = useState("");
  const scrollRef = useRef();

  // ✅ Ensure selectedUser exists and match IDs correctly
  const isOnline =
    selectedUser && onlineUsers.some((userId) => userId === selectedUser._id);

  const handleSend = () => {
    if (text.trim() === "") return;
    sendMessage(text);
    setText("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  // ✅ Auto-scroll to the last message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-box">
      <div className="chat-header">
        <strong>{selectedUser?.username || "Select a user"}</strong> <br />
        {selectedUser && (
          <small className={`status-text ${isOnline ? "online" : "offline"}`}>
            {isOnline ? "Online" : "Offline"}
          </small>
        )}
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="no-messages">No messages yet. Say hi 👋</div>
        )}

        {messages.map((m, i) => (
          <div
            key={m._id || i}
            ref={i === messages.length - 1 ? scrollRef : null}
            className={`msg ${
              m.sender?._id === selectedUser?._id ? "received" : "sent"
            }`}
          >
            <div className="msg-text">{m.message}</div>
            <div className="msg-info">
              <small className="msg-time">
                {m.createdAt
                  ? new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </small>
              {m.sender?._id === currentUser._id && (
                <small className={`msg-status ${m.isRead ? "read" : ""}`}>
                  {m.isRead ? "✔✔" : "✔"}
                </small>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default ChatBox;
