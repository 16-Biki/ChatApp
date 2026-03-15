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
  const [unreadCounts, setUnreadCounts] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Initialize socket
  useEffect(() => {
    if (user?._id) {
      const newSocket = io("https://chatapp-htm4.onrender.com", {
        transports: ["websocket"],
        secure: true,
        withCredentials: true,
      });

      setSocketInstance(newSocket);

      newSocket.emit("registerUser", user._id);

      newSocket.on("updateOnlineUsers", (users) => {
        setOnlineUsers(users);
      });

      return () => newSocket.disconnect();
    }
  }, [user]);

  // Load users
  useEffect(() => {
    if (!user?._id) return;

    axios
      .get("https://chatapp-htm4.onrender.com/api/auth/all")
      .then((res) => {
        const filtered = res.data.filter((u) => u._id !== user._id);
        setUsers(filtered);
        setLoadingUsers(false);
      })
      .catch((err) => console.error("Error fetching users:", err));
  }, [user]);

  //  Load unread message counts
  useEffect(() => {
    if (!user?._id) return;

    axios
      .get(`https://chatapp-htm4.onrender.com/api/messages/unread/${user._id}`)
      .then((res) => {
        setUnreadCounts(res.data);
      })
      .catch((err) => console.error("Unread fetch error:", err));
  }, [user]);

  // Handle socket messages
  useEffect(() => {
    if (!socketInstance) return;

    const handleMessage = (msg) => {
      const isCurrentChat =
        msg.sender._id === selectedUser?._id && msg.receiver._id === user._id;

      if (
        (msg.sender._id === user._id &&
          msg.receiver._id === selectedUser?._id) ||
        isCurrentChat
      ) {
        setMessages((prev) => {
          const filtered = prev.filter(
            (m) =>
              !(m.message === msg.message && m.sender._id === msg.sender._id),
          );

          return [...filtered, msg];
        });

        if (isCurrentChat) {
          markMessagesAsRead(msg.sender._id);
        }
      }

      // Increase unread count if chat is NOT open
      if (
        msg.receiver._id === user._id &&
        msg.sender._id !== selectedUser?._id
      ) {
        setUnreadCounts((prev) => ({
          ...prev,
          [msg.sender._id]: (prev[msg.sender._id] || 0) + 1,
        }));
      }
    };

    const handleRead = ({ senderId, receiverId }) => {
      if (senderId === user._id && receiverId === selectedUser?._id) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.sender._id === user._id ? { ...msg, isRead: true } : msg,
          ),
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

  // Mark messages read
  const markMessagesAsRead = (receiverId) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.sender._id === receiverId ? { ...msg, isRead: true } : msg,
      ),
    );

    if (socketInstance) {
      socketInstance.emit("markAsRead", {
        senderId: receiverId,
        receiverId: user._id,
      });
    }

    axios.put("https://chatapp-htm4.onrender.com/api/messages/read", {
      sender: receiverId,
      receiver: user._id,
    });
  };

  // Load messages
  const loadMessages = async (receiverId) => {
    if (!receiverId || !user?._id) return;

    try {
      const userData = users.find((u) => u._id === receiverId);
      if (!userData) return;

      setSelectedUser(userData);

      // Reset unread count
      setUnreadCounts((prev) => ({
        ...prev,
        [receiverId]: 0,
      }));

      const res = await axios.get(
        `https://chatapp-htm4.onrender.com/api/messages/${user._id}/${receiverId}`,
      );

      setMessages(res.data);
    } catch (err) {
      console.error(
        "Error fetching messages:",
        err.response?.data || err.message,
      );
    }
  };

  // Send message
  const sendMessage = (text) => {
    if (!text || !selectedUser || !socketInstance) return;

    const tempMsg = {
      _id: Date.now().toString(),
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
          unreadCounts={unreadCounts}
          loading={loadingUsers}
        />

        {selectedUser ? (
          <ChatBox
            selectedUser={selectedUser}
            messages={messages}
            sendMessage={sendMessage}
            currentUser={user}
            onlineUsers={onlineUsers}
          />
        ) : (
          <div className="no-chat">👉 Select a user to start chatting</div>
        )}
      </div>
    </div>
  );
}

export default Chat;
