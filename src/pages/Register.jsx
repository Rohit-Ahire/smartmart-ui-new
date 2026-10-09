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
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaTimesCircle,
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Track which fields have been touched (blurred)
  const [touched, setTouched] = useState({
    fullName: false,
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // --- Individual field validators ---
  const validateFullName = (val) => {
    if (!val.trim()) return "Full name is required.";
    if (val.trim().length < 2) return "Full name must be at least 2 characters.";
    if (!/^[a-zA-Z\s]+$/.test(val.trim())) return "Full name can only contain letters and spaces.";
    return null;
  };

  const validateUsername = (val) => {
    if (!val.trim()) return "Username is required.";
    if (val.trim().length < 3) return "Username must be at least 3 characters.";
    if (val.trim().length > 50) return "Username must be at most 50 characters.";
    if (/^\d+$/.test(val.trim())) return "Username cannot be only numbers.";
    if (!/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d_]+$/.test(val.trim()))
      return "Username must contain both letters and numbers (only letters, digits, _ allowed).";
    return null;
  };

  const validateEmail = (val) => {
    if (!val.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) return "Please enter a valid email address.";
    return null;
  };

  const validatePassword = (val) => {
    if (!val) return "Password is required.";
    if (val.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  const validateConfirmPassword = (val) => {
    if (!val) return "Confirm password is required.";
    if (val !== password) return "Passwords do not match.";
    return null;
  };

  // --- Aggregate form validation ---
  const validateForm = () => {
    return (
      validateFullName(fullName) ||
      validateUsername(username) ||
      validateEmail(email) ||
      validatePassword(password) ||
      validateConfirmPassword(confirmPassword)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Mark all fields as touched
    setTouched({
      fullName: true,
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register", {
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
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

  // Helper to determine if a field should show its error
  const fieldError = (field, validator, value) => {
    if (!touched[field]) return null;
    return validator(value);
  };

  const fullNameErr = fieldError("fullName", validateFullName, fullName);
  const usernameErr = fieldError("username", validateUsername, username);
  const emailErr = fieldError("email", validateEmail, email);
  const passwordErr = fieldError("password", validatePassword, password);
  const confirmPasswordErr = fieldError("confirmPassword", validateConfirmPassword, confirmPassword);

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

          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <label>Full Name</label>
            <div className={`input-icon ${fullNameErr ? "input-error" : touched.fullName && !fullNameErr ? "input-valid" : ""}`}>
              <FaIdCard />
              <input
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onBlur={() => handleBlur("fullName")}
              />
              {touched.fullName && (
                <span className="input-status-icon">
                  {fullNameErr ? <FaTimesCircle className="icon-error" /> : <FaCheckCircle className="icon-valid" />}
                </span>
              )}
            </div>
            {fullNameErr && <span className="field-error">{fullNameErr}</span>}

            {/* Username */}
            <label>Username</label>
            <div className={`input-icon ${usernameErr ? "input-error" : touched.username && !usernameErr ? "input-valid" : ""}`}>
              <FaUser />
              <input
                type="text"
                placeholder="e.g. john123 (letters + numbers)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => handleBlur("username")}
              />
              {touched.username && (
                <span className="input-status-icon">
                  {usernameErr ? <FaTimesCircle className="icon-error" /> : <FaCheckCircle className="icon-valid" />}
                </span>
              )}
            </div>
            {usernameErr && <span className="field-error">{usernameErr}</span>}

            {/* Email */}
            <label>Email</label>
            <div className={`input-icon ${emailErr ? "input-error" : touched.email && !emailErr ? "input-valid" : ""}`}>
              <FaEnvelope />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur("email")}
              />
              {touched.email && (
                <span className="input-status-icon">
                  {emailErr ? <FaTimesCircle className="icon-error" /> : <FaCheckCircle className="icon-valid" />}
                </span>
              )}
            </div>
            {emailErr && <span className="field-error">{emailErr}</span>}

            {/* Password */}
            <label>Password</label>
            <div className={`input-icon ${passwordErr ? "input-error" : touched.password && !passwordErr ? "input-valid" : ""}`}>
              <FaLock />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
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

            {/* Confirm Password */}
            <label>Confirm Password</label>
            <div className={`input-icon ${confirmPasswordErr ? "input-error" : touched.confirmPassword && !confirmPasswordErr ? "input-valid" : ""}`}>
              <FaLock />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => handleBlur("confirmPassword")}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {confirmPasswordErr && <span className="field-error">{confirmPasswordErr}</span>}

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
