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
  FaEnvelope,
  FaIdCard,
  FaUserPlus,
} from "react-icons/fa";
import api from "../services/api";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!fullName.trim()) return "Full name is required.";
    if (!username.trim()) return "Username is required.";
    if (username.trim().length < 3) return "Username must be at least 3 characters.";
    if (!email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email.";
    if (!password) return "Password is required.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register", {
        fullName,
        username,
        email,
        password,
      });

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      console.error(err);
      if (!err.response) {
        setError("Cannot reach the server. Check your internet and try again.");
      } else if (err.response.status === 409) {
        setError(err.response.data?.message || "Username or email already exists.");
      } else if (err.response.status === 400) {
        setError(err.response.data?.message || "Please check your input and try again.");
      } else {
        setError(err.response.data?.message || "Something went wrong. Please try again.");
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
    <div className="register-page">
      <section className="register-left">
        <div className="brand">
          <h1>
            <FaShoppingCart className="brand-icon" /> SmartMart
          </h1>
          <p>Retail POS Software</p>
        </div>

        <h2>
          Join <span>SmartMart</span> Today
        </h2>

        <p className="register-desc">
          Create your account and start managing products, customers, billing
          and GST invoices from one simple dashboard.
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

      <section className="register-right">
        <div className="register-card">
          <h2>Create Account</h2>
          <p>Fill in the details to get started</p>

          <form onSubmit={handleSubmit}>
            <label>Full Name</label>
            <div className="input-icon">
              <FaIdCard />
              <input
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <label>Username</label>
            <div className="input-icon">
              <FaUser />
              <input
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <label>Email</label>
            <div className="input-icon">
              <FaEnvelope />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <label>Password</label>
            <div className="input-icon">
              <FaLock />
              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <label>Confirm Password</label>
            <div className="input-icon">
              <FaLock />
              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {error && <span className="register-error">{error}</span>}
            {success && <span className="register-success">{success}</span>}

            <button type="submit" className="register-submit" disabled={loading}>
              <FaUserPlus />{" "}
              {loading ? "Creating Account..." : "Register"}
            </button>

            <div className="register-footer">
              Already have an account?{" "}
              <Link to="/">Login</Link>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Register;
