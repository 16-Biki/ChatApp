import React from "react";
import { useNavigate } from "react-router-dom";


function Navbar({ user }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("chatUser");
    navigate("/login");
  };

  return (
    <div className="navbar">
      <h2>ChatApp</h2>
      <div className="navbar-right">
        <span>Hi, {user.username}</span>
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
}

export default Navbar;
