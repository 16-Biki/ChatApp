import React from "react";
import "./UserList.css";

function UserList({
  users = [],
  loadMessages,
  onlineUsers = [],
  unreadCounts = {},
  loading = false,
}) {
  return (
    <div className="user-list">
      <h3 className="user-title">Users</h3>

      {/* Loading state */}
      {loading && <div className="user-loading">Loading users...</div>}

      {!loading &&
        users.map((u) => (
          <div
            key={u._id}
            className="user-item"
            onClick={() => loadMessages(u._id)}
          >
            <div className="user-info">
              <div className="username">{u.username}</div>

              {unreadCounts[u._id] > 0 && (
                <div className="unread-text">
                  {unreadCounts[u._id]} unread message
                  {unreadCounts[u._id] > 1 ? "s" : ""}
                </div>
              )}
            </div>

            <span
              className={`status-dot ${
                onlineUsers.includes(u._id) ? "online" : "offline"
              }`}
            ></span>
          </div>
        ))}
    </div>
  );
}

export default UserList;
