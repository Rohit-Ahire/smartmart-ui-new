import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaShoppingCart,
  FaEnvelope,
  FaLock,
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaEyeSlash,
  FaKey,
} from "react-icons/fa";
import api from "../services/api";
import "./ForgotPassword.css";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Track touched fields
  const [touched, setTouched] = useState({
    email: false,
    newPassword: false,
    confirmPassword: false,
  });

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // --- Validators ---
  const validateEmail = (val) => {
    if (!val.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) return "Please enter a valid email address.";
    return null;
  };

  const validatePassword = (val) => {
    if (!val) return "New password is required.";
    if (val.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  const validateConfirmPassword = (val) => {
    if (!val) return "Confirm password is required.";
    if (val !== newPassword) return "Passwords do not match.";
    return null;
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Mark all touched
    setTouched({ email: true, newPassword: true, confirmPassword: true });

    const emailError = validateEmail(email);
    const passwordError = validatePassword(newPassword);
    const confirmError = validateConfirmPassword(confirmPassword);

    if (emailError || passwordError || confirmError) {
      setError(emailError || passwordError || confirmError);
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", {
        email: email.trim(),
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      });
      setMessage(
        res.data?.message || "Password reset successfully! Redirecting to login..."
      );
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error(err);
      if (!err.response) {
        setError("Cannot reach the server. Please check your connection.");
      } else {
        setError(
          err.response.data?.message || "Failed to reset password. Please check your email and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const emailErr = touched.email ? validateEmail(email) : null;
  const passwordErr = touched.newPassword ? validatePassword(newPassword) : null;
  const confirmErr = touched.confirmPassword ? validateConfirmPassword(confirmPassword) : null;

  return (
    <div className="forgot-page">
      <section className="forgot-left">
        <div className="brand">
          <h1>
            <FaShoppingCart className="brand-icon" /> SmartMart
          </h1>
          <p>Retail POS Software</p>
        </div>

        <h2>
          Reset Your <span>Password</span>
        </h2>

        <p className="forgot-desc">
          Forgot your password? No worries! Just enter your registered email
          address and create a new password. It&apos;s that simple.
        </p>

        <ul className="forgot-steps">
          <li>
            <span className="step-num">1</span> Enter your registered email address
          </li>
          <li>
            <span className="step-num">2</span> Create a new password
          </li>
          <li>
            <span className="step-num">3</span> Confirm and you&apos;re all set!
          </li>
        </ul>
      </section>

      <section className="forgot-right">
        <div className="forgot-card">
          <h2>
            <FaKey style={{ marginRight: 10, color: "#059669", fontSize: 22 }} />
            Reset Password
          </h2>
          <p>Enter your email and set a new password</p>

          <form onSubmit={handleResetPassword} noValidate>
            {/* Email */}
            <label>Email Address</label>
            <div className={`input-icon ${emailErr ? "input-error" : touched.email && !emailErr ? "input-valid" : ""}`}>
              <FaEnvelope />
              <input
                type="email"
                placeholder="e.g. admin@smartmart.com"
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

            {/* New Password */}
            <label>New Password</label>
            <div className={`input-icon ${passwordErr ? "input-error" : touched.newPassword && !passwordErr ? "input-valid" : ""}`}>
              <FaLock />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onBlur={() => handleBlur("newPassword")}
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
            <label>Confirm New Password</label>
            <div className={`input-icon ${confirmErr ? "input-error" : touched.confirmPassword && !confirmErr ? "input-valid" : ""}`}>
              <FaLock />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter new password"
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
            {confirmErr && <span className="field-error">{confirmErr}</span>}

            {error && <span className="error-text">{error}</span>}
            {message && (
              <span className="success-text">
                <FaCheckCircle style={{ marginRight: 6 }} />
                {message}
              </span>
            )}

            <button
              type="submit"
              className="forgot-submit"
              disabled={loading}
            >
              <FaLock /> {loading ? "Resetting..." : "Reset Password"}
            </button>

            <div className="forgot-footer">
              <Link to="/">
                <FaArrowLeft style={{ marginRight: 6 }} /> Back to Login
              </Link>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

export default ForgotPassword;
