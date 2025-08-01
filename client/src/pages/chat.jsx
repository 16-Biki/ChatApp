import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import Navbar from "../components/Navbar";
import UserList from "../components/UserList";
import ChatBox from "../components/ChatBox";
import "./Chat.css";

function Chat({ user }) {
  const [socketInstance, setSocketInstance] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // ✅ Initialize socket for each logged-in user
  useEffect(() => {
    if (user?._id) {
      const newSocket = io("http://localhost:5000");
      setSocketInstance(newSocket);

      // Register the user
      newSocket.emit("registerUser", user._id);

      // ✅ Listen for online users update
      newSocket.on("updateOnlineUsers", (users) => {
        setOnlineUsers(users); // Store array of online user IDs
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  // ✅ Load all users except the current one
  useEffect(() => {
    if (!user?._id) return;
    axios
      .get("http://localhost:5000/api/auth/all")
      .then((res) => setUsers(res.data.filter((u) => u._id !== user._id)))
      .catch((err) => console.error("Error fetching users:", err));
  }, [user]);

  // ✅ Handle incoming messages and read receipts
  useEffect(() => {
    if (!socketInstance) return;

    const handleMessage = (msg) => {
      if (
        (msg.sender._id === user._id && msg.receiver._id === selectedUser?._id) ||
        (msg.sender._id === selectedUser?._id && msg.receiver._id === user._id)
      ) {
        setMessages((prev) => {
          const filtered = prev.filter(
            (m) => !(m.message === msg.message && m.sender._id === msg.sender._id)
          );
          return [...filtered, msg];
        });
      }
    };

    const handleRead = ({ senderId, receiverId }) => {
      if (senderId === user._id && receiverId === selectedUser?._id) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.sender._id === user._id ? { ...msg, isRead: true } : msg
          )
        );
      }
    };

    socketInstance.on("receiveMessage", handleMessage);
    socketInstance.on("messageRead", handleRead);

    return () => {
      socketInstance.off("receiveMessage", handleMessage);
      socketInstance.off("messageRead", handleRead);
    };
  }, [selectedUser, user, socketInstance]);

  // ✅ Optimistic read receipt update
  const markMessagesAsRead = (receiverId) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.sender._id === receiverId ? { ...msg, isRead: true } : msg
      )
    );

    if (socketInstance) {
      socketInstance.emit("markAsRead", {
        senderId: receiverId,
        receiverId: user._id,
      });
    }

    axios
      .put("http://localhost:5000/api/messages/read", {
        sender: receiverId,
        receiver: user._id,
      })
      .catch((err) => console.error("Read update failed:", err));
  };

  // ✅ Load previous messages and mark them as read immediately
  const loadMessages = async (receiverId) => {
    if (!receiverId || !user?._id) return;

    try {
      const userData = users.find((u) => u._id === receiverId);
      if (!userData) return;

      setSelectedUser(userData);

      const res = await axios.get(
        `http://localhost:5000/api/messages/${user._id}/${receiverId}`
      );
      setMessages(res.data);

      markMessagesAsRead(receiverId);
    } catch (err) {
      console.error("Error fetching messages:", err.response?.data || err.message);
    }
  };

  // ✅ Send message with optimistic UI
  const sendMessage = (text) => {
    if (!text || !selectedUser || !socketInstance) return;

    const tempId = Date.now().toString();
    const tempMsg = {
      _id: tempId,
      sender: user,
      receiver: selectedUser,
      message: text,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setMessages((prev) => [...prev, tempMsg]);

    socketInstance.emit("sendMessage", {
      sender: user,
      receiver: selectedUser,
      message: text,
    });
  };

  return (
    <div className="chat-container">
      <Navbar user={user} />
      <div className="chat-body">
        <UserList
          users={users}
          loadMessages={loadMessages}
          onlineUsers={onlineUsers}
        />
        {selectedUser ? (
          <ChatBox
            selectedUser={selectedUser}
            messages={messages}
            sendMessage={sendMessage}
            currentUser={user}
          />
        ) : (
          <div className="no-chat">👈 Select a user to start chatting</div>
        )}
      </div>
    </div>
  );
}

export default Chat;
