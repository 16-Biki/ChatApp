import React, { useState, useEffect, useRef } from "react";
import "./ChatBox.css";

function ChatBox({
  selectedUser,
  messages,
  sendMessage,
  currentUser,
  onlineUsers = [],
}) {
  const [text, setText] = useState("");
  const scrollRef = useRef();

  const isOnline =
    selectedUser && onlineUsers.includes(selectedUser._id.toString());

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

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Format message time
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  // Format message date (Today / Yesterday / Date)
  const formatDate = (date) => {
    const msgDate = new Date(date);
    const today = new Date();
    const yesterday = new Date();

    yesterday.setDate(today.getDate() - 1);

    if (msgDate.toDateString() === today.toDateString()) {
      return "Today";
    }

    if (msgDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    return msgDate.toLocaleDateString();
  };

  let lastDate = "";

  return (
    <div className="chat-box">
      {/* Chat Header */}
      <div className="chat-header">
        <strong>{selectedUser?.username || "Select a user"}</strong>
        <br />

        {selectedUser && (
          <small className={`status-text ${isOnline ? "online" : "offline"}`}>
            {isOnline ? "Online" : "Offline"}
          </small>
        )}
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="no-messages">No messages yet. Say hi 👋</div>
        )}

        {messages.map((m, i) => {
          const messageDate = formatDate(m.createdAt);

          const showDateDivider = messageDate !== lastDate;
          lastDate = messageDate;

          return (
            <React.Fragment key={m._id || i}>
              {showDateDivider && (
                <div className="date-divider">{messageDate}</div>
              )}

              <div
                ref={i === messages.length - 1 ? scrollRef : null}
                className={`msg ${
                  m.sender?._id === selectedUser?._id ? "received" : "sent"
                }`}
              >
                <div className="msg-text">{m.message}</div>

                <div className="msg-info">
                  <small className="msg-time">
                    {m.createdAt ? formatTime(m.createdAt) : ""}
                  </small>

                  {m.sender?._id === currentUser._id && (
                    <small className={`msg-status ${m.isRead ? "read" : ""}`}>
                      {m.isRead ? "✔✔" : "✔"}
                    </small>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
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
