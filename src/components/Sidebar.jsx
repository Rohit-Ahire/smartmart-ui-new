import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Admin";

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("username");
    navigate("/");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-badge">🛒</span>
        <div className="brand-text">
          <strong>SmartMart</strong>
          <small>Retail POS</small>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard">
          <span>📊</span><span>Dashboard</span>
        </NavLink>
        <NavLink to="/products">
          <span>📦</span><span>Products</span>
        </NavLink>
        <NavLink to="/customers">
          <span>👥</span><span>Customers</span>
        </NavLink>
        <NavLink to="/billing">
          <span>🧾</span><span>Billing</span>
        </NavLink>
        <NavLink to="/invoice">
          <span>📄</span><span>Invoices</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip">
          <span className="user-avatar">
            {username.charAt(0).toUpperCase()}
          </span>
          <div className="user-meta">
            <strong>{username}</strong>
            <small>Store Admin</small>
          </div>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}