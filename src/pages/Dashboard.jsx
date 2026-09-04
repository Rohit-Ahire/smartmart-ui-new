import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import "./Dashboard.css";

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    customers: 0,
    bills: 0,
    revenue: 0,
  });

  const [recentBills, setRecentBills] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [productsRes, customersRes, billsRes] = await Promise.all([
        axios.get("http://localhost:8080/api/products"),
        axios.get("http://localhost:8080/api/customers"),
        axios.get("http://localhost:8080/api/invoices"),
      ]);

      const bills = billsRes.data || [];

      const revenue = bills.reduce(
        (sum, bill) => sum + Number(bill.totalAmount || 0),
        0
      );

      setStats({
        products: productsRes.data.length,
        customers: customersRes.data.length,
        bills: bills.length,
        revenue,
      });

      setRecentBills(bills.slice(-5).reverse());
    } catch (error) {
      console.error("Dashboard Error:", error);
    }
  };

  return (
    <div className="dashboard-page">
      <Sidebar />

      <div className="dashboard-content">
        <h1>Dashboard</h1>
        <p>Retail POS Overview</p>

        <div className="stats-grid">
          <div className="stat-card">
            <div style={{ fontSize: "40px" }}>📦</div>
            <h2>{stats.products}</h2>
            <p>Total Products</p>
          </div>

          <div className="stat-card">
            <div style={{ fontSize: "40px" }}>👥</div>
            <h2>{stats.customers}</h2>
            <p>Total Customers</p>
          </div>

          <div className="stat-card">
            <div style={{ fontSize: "40px" }}>🧾</div>
            <h2>{stats.bills}</h2>
            <p>Total Bills</p>
          </div>

          <div className="stat-card">
            <div style={{ fontSize: "40px" }}>💰</div>
            <h2>₹{stats.revenue.toLocaleString()}</h2>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="recent-section">
          <h3>Recent Bills</h3>

          <table className="recent-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {recentBills.length > 0 ? (
                recentBills.map((bill) => (
                  <tr key={bill.id}>
                    <td>{bill.id}</td>
                    <td>{bill.customerName}</td>
                    <td>₹{bill.totalAmount}</td>
                    <td>
                      <span className="status-badge">
                        {bill.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                    No bills found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}