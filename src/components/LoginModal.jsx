import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./LoginModal.css";

function LoginModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Login button clicked");

    try {
      const response = await api.post("/auth/login", {
        username,
        password,
      });

      console.log(response.data);

      localStorage.setItem("user", JSON.stringify(response.data));
      localStorage.setItem("username", username);

      onClose();
      navigate("/dashboard");
    } catch (err) {
      console.log(err.response);
      setError("Wrong username or password");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <button className="close-btn" onClick={onClose}>×</button>

        <h2>Login to SmartMart</h2>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <span className="error-text">{error}</span>}

          <button type="submit" className="login-submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;