# 💬 ChatApp – Real-Time MERN Chat Application

A full-stack real-time chat application built using **MongoDB, Express, React, Node.js**, and **Socket.IO**.  
Users can sign up, log in, see online users, send private messages, and get read receipts in real time.

---

## 🚀 Features

✅ User Authentication (Signup / Login)  
✅ Real-time Messaging with Socket.IO  
✅ Online / Offline User Status  
✅ Read Receipts (✔ / ✔✔)  
✅ Private One-to-One Chats  
✅ Message History Stored in MongoDB  
✅ MERN Stack Architecture  
✅ Deployed Backend + Frontend  

---

## 🧱 Tech Stack

### Frontend
- React (Vite)
- React Router DOM
- Axios
- Socket.IO Client

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- Socket.IO
- CORS
- dotenv

---

## 📁 Project Structure

ChatApp
│
├── client
│ ├── src
│ │ ├── components
│ │ │ ├── ChatBox.jsx
│ │ │ ├── Navbar.jsx
│ │ │ └── UserList.jsx
│ │ ├── pages
│ │ │ ├── Login.jsx
│ │ │ ├── Signup.jsx
│ │ │ └── Chat.jsx
│ │ └── App.jsx
│
├── server
│ ├── models
│ │ ├── User.js
│ │ └── Message.js
│ ├── Routes
│ │ ├── authRoutes.js
│ │ └── messageRoutes.js
│ ├── index.js
│ └── .env
│
└── README.md


---

## ⚙️ Environment Variables

Create a `.env` file inside `/server`:

PORT=5000
MONGO_URI=your_mongodb_connection_string


---

## 🛠 Installation (Local Setup)

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/ChatApp.git
cd ChatApp

2️⃣ Backend Setup

cd server
npm install
npm start

Backend runs on:

http://localhost:5000

3️⃣ Frontend Setup

cd client
npm install
npm run dev

Frontend runs on:

http://localhost:5173

🔌 Socket.IO Events
Client → Server

    registerUser

    sendMessage

    markAsRead

Server → Client

    receiveMessage

    updateOnlineUsers

    messageRead

📡 API Routes
Auth

POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/all

Messages

GET /api/messages/:userId/:receiverId
PUT /api/messages/read

🧠 How It Works

    User logs in → socket connection established

    User ID registered on server

    Online users tracked using Map

    Messages saved in MongoDB

    Messages sent via Socket.IO

    Read receipts handled in real time

    UI updates instantly

⚠️ Important Notes

    Passwords are currently stored in plain text (for demo only)

    JWT authentication not implemented

    No group chat (only 1–1 chat)

📌 Future Improvements

    🔐 JWT Authentication

    🔒 Password hashing (bcrypt)

    👥 Group chats

    📎 File sharing

    🟢 Typing indicator

    🧹 Message delete

    📱 Mobile responsive UI
