import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaShoppingCart,
  FaBolt,
  FaBoxOpen,
  FaUsers,
  FaReceipt,
  FaFileInvoice,
  FaLock,
  FaUser,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import api from "../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Track touched fields
  const [touched, setTouched] = useState({
    username: false,
    password: false,
  });

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const validateUsername = (val) => {
    if (!val.trim()) return "Username is required.";
    return null;
  };

  const validatePassword = (val) => {
    if (!val.trim()) return "Password is required.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Mark all touched
    setTouched({ username: true, password: true });

    const usernameError = validateUsername(username);
    const passwordError = validatePassword(password);

    if (usernameError || passwordError) {
      setError(usernameError || passwordError);
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/login", { username: username.trim(), password });
      localStorage.setItem("user", JSON.stringify(res.data));
      localStorage.setItem("username", username.trim());
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      if (!err.response) {
        if (err.message && err.message.includes("Network Error")) {
          setError(
            "Cannot connect to the server. This may be a CORS or network issue. Please try again later."
          );
        } else {
          setError(
            "Cannot reach the server. Check your internet and try again."
          );
        }
      } else if (
        err.response.status === 401 ||
        (err.response.data &&
          /invalid (username|password)/i.test(
            String(err.response.data?.message || "")
          ))
      ) {
        setError("Wrong username or password.");
      } else if (err.response.status === 403) {
        setError("Access denied. Please contact the administrator.");
      } else {
        setError(
          err.response.data?.message ||
            "Something went wrong on the server. Please try again."
        );
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

  const usernameErr = touched.username ? validateUsername(username) : null;
  const passwordErr = touched.password ? validatePassword(password) : null;

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

          <form onSubmit={handleSubmit} noValidate>
            <label>Username</label>
            <div className={`input-icon ${usernameErr ? "input-error" : ""}`}>
              <FaUser />
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => handleBlur("username")}
              />
            </div>
            {usernameErr && <span className="field-error">{usernameErr}</span>}

            <label>Password</label>
            <div className={`input-icon ${passwordErr ? "input-error" : ""}`}>
              <FaLock />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur("password")}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {passwordErr && <span className="field-error">{passwordErr}</span>}

            <div className="forgot-link-container">
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            {error && <span className="error-text">{error}</span>}

            <button type="submit" className="login-submit" disabled={loading}>
              <FaLock className="submit-icon" />{" "}
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="login-footer">
              Don&apos;t have an account?{" "}
              <Link to="/register">Register</Link>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Login;