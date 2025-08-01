import React from "react";
import "./UserList.css";
function UserList({ users, loadMessages, onlineUsers = [] }) {
  return (
    <div className="user-list">
      <h3>Users</h3>
      {users.map((u) => (
        <div
          key={u._id}
          className="user-item"
          onClick={() => loadMessages(u._id)}
        >
          <span>{u.username}</span>
          {/* ✅ Online/Offline status dot */}
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
