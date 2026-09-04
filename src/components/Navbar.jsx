import { useState } from "react";
import LoginModal from "./LoginModal";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <header className="navbar">
        <div className="logo">
          <h2>SmartMart</h2>
          <p>Retail POS</p>
        </div>

        <nav className={menuOpen ? "nav active" : "nav"}>
          <a href="/">Home</a>
          <a href="#features">Features</a>
          <a href="#contact">Contact</a>
        </nav>

        <button className="login-btn" onClick={() => setShowLogin(true)}>
          Login
        </button>

        <button
          className="menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </header>

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
      />
    </>
  );
}

export default Navbar;