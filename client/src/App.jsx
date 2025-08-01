import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Chat from "./pages/chat"

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("chatUser")));

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/chat" /> : <Navigate to="/login" />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login setUser={setUser} />} />
      <Route path="/chat" element={user ? <Chat user={user} /> : <Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
