import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaShoppingCart,
  FaBolt,
  FaBoxOpen,
  FaUsers,
  FaReceipt,
  FaFileInvoice,
  FaLock,
  FaUser,
} from "react-icons/fa";
import api from "../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/login", { username, password });
      localStorage.setItem("user", JSON.stringify(res.data));
      localStorage.setItem("username", username);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      if (!err.response) {
        setError("Cannot reach the server. Check your internet and try again.");
      } else if (
        err.response.status === 401 ||
        (err.response.data &&
          /invalid (username|password)/i.test(
            String(err.response.data?.message || "")
          ))
      ) {
        setError("Wrong username or password.");
      } else {
        setError("Something went wrong on the server. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const features = [
    [FaBolt, "Fast Billing"],
    [FaBoxOpen, "Inventory Management"],
    [FaUsers, "Customer Management"],
    [FaReceipt, "GST Ready Invoices"],
    [FaFileInvoice, "PDF Invoice Download"],
    [FaLock, "Simple & Secure"],
  ];

  return (
    <div className="login-page">
      <section className="login-left">
        <div className="brand">
          <h1>
            <FaShoppingCart className="brand-icon" /> SmartMart
          </h1>
          <p>Retail POS Software</p>
        </div>

        <h2>
          Smart Billing Software for <span>Retail Shops</span>
        </h2>

        <p className="login-desc">
          Manage products, customers, billing and GST invoices from one simple
          dashboard.
        </p>

        <ul className="feature-list">
          {features.map(([Icon, label]) => (
            <li key={label}>
              <span className="feature-icon">
                <Icon />
              </span>{" "}
              {label}
            </li>
          ))}
        </ul>
      </section>

      <section className="login-right">
        <div className="login-card">
          <h2>Welcome Back</h2>
          <p>Login to your shop dashboard</p>

          <form onSubmit={handleSubmit}>
            <label>Username</label>
            <div className="input-icon">
              <FaUser />
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <label>Password</label>
            <div className="input-icon">
              <FaLock />
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <span className="error-text">{error}</span>}

            <button type="submit" className="login-submit" disabled={loading}>
              <FaLock className="submit-icon" />{" "}
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="demo-hint">
              Demo login: <strong>admin</strong> / <strong>admin123</strong>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Login;