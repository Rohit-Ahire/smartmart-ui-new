import { NavLink } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <h1>SmartMart</h1>
        <p>Retail POS</p>

        <nav>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/customers">Customers</NavLink>
          <NavLink to="/billing">Billing</NavLink>
          <NavLink to="/invoice">Invoices</NavLink>
        </nav>
      </div>

      <button className="logout-btn">Logout</button>
    </aside>
  );
}