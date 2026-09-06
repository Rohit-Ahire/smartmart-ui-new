import { useEffect, useState } from "react";
import {
  FaBoxOpen,
  FaUsers,
  FaReceipt,
  FaCoins,
  FaChartBar,
} from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import "./Dashboard.css";
import "./shared.css";

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    customers: 0,
    bills: 0,
    revenue: 0,
  });

  const [recentBills, setRecentBills] = useState([]);

  const username = localStorage.getItem("username") || "Admin";

  function greeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }

  async function loadDashboard() {
    try {
      const [productsRes, customersRes, billsRes] = await Promise.all([
        api.get("/products"),
        api.get("/customers"),
        api.get("/invoices"),
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
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const statCards = [
    {
      label: "Total Products",
      value: stats.products,
      icon: <FaBoxOpen />,
      tone: "teal",
    },
    {
      label: "Total Customers",
      value: stats.customers,
      icon: <FaUsers />,
      tone: "amber",
    },
    {
      label: "Total Bills",
      value: stats.bills,
      icon: <FaReceipt />,
      tone: "emerald",
    },
    {
      label: "Total Revenue",
      value: `₹${stats.revenue.toLocaleString()}`,
      icon: <FaCoins />,
      tone: "violet",
    },
  ];

  return (
    <>
      <Sidebar />

      <div className="page-shell">
        <div className="page-header">
          <div>
            <span className="page-eyebrow">
              <FaChartBar /> Dashboard Overview
            </span>
            <h1 className="page-title">
              {greeting()}, {username}
            </h1>
            <p className="page-subtitle">
              Here is what is happening at your store today.
            </p>
          </div>
        </div>

        <div className="stats-grid">
          {statCards.map((card) => (
            <div className="stat-card" key={card.label}>
              <span className={`stat-icon ${card.tone}`}>{card.icon}</span>
              <div>
                <h2>{card.value}</h2>
                <p>{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="recent-section">
          <div className="section-head">
            <h3>Recent Bills</h3>
          </div>

          <div className="tbl-card">
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Bill ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recentBills.length > 0 ? (
                    recentBills.map((bill) => (
                      <tr key={bill.id}>
                        <td>#{bill.id}</td>
                        <td>{bill.customerName}</td>
                        <td>₹{bill.totalAmount}</td>
                        <td>
                          <span
                            className={
                              bill.paymentStatus === "PAID"
                                ? "badge badge-paid"
                                : "badge badge-pending"
                            }
                          >
                            {bill.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="empty-state">
                        No bills yet. Create your first bill from the Billing page.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}