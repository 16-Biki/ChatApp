import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Auth.css";

function Login({ setUser }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handlechange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handlesubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await axios.post(
        "https://chatapp-htm4.onrender.com/api/auth/login",
        form,
      );

      localStorage.setItem("chatUser", JSON.stringify(res.data.user));

      setUser(res.data.user);

      navigate("/chat");
    } catch (error) {
      alert(error.response?.data?.msg || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1>ChatApp</h1>

      <form onSubmit={handlesubmit}>
        <input
          type="email"
          name="email"
          placeholder="Enter email"
          onChange={handlechange}
          required
        />

        <br />

        <input
          type="password"
          name="password"
          placeholder="Enter password"
          onChange={handlechange}
          required
        />

        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p>
        Don't have an account?
        <button onClick={() => navigate("/signup")}>Signup</button>
      </p>
    </div>
  );
}

export default Login;
