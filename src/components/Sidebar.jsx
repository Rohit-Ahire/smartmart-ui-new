import { NavLink, useNavigate } from "react-router-dom";
import {
  FaShoppingCart,
  FaChartBar,
  FaBoxOpen,
  FaUsers,
  FaReceipt,
  FaFileInvoice,
  FaSignOutAlt,
} from "react-icons/fa";
import "./Sidebar.css";

const NAV_ITEMS = [
  { to: "/dashboard", icon: FaChartBar, label: "Dashboard" },
  { to: "/products", icon: FaBoxOpen, label: "Products" },
  { to: "/customers", icon: FaUsers, label: "Customers" },
  { to: "/billing", icon: FaReceipt, label: "Billing" },
  { to: "/invoice", icon: FaFileInvoice, label: "Invoices" },
];

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
        <span className="brand-badge">
          <FaShoppingCart />
        </span>
        <div className="brand-text">
          <strong>SmartMart</strong>
          <small>Retail POS</small>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}>
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
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
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </aside>
  );
}