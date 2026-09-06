import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import "./Customers.css";
import "./shared.css";

const API = "/customers";

const EMPTY_FORM = { name: "", phone: "", email: "" };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    try {
      const res = await api.get(API);
      setCustomers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;

    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone || "").toLowerCase().includes(q)
    );
  }, [customers, search]);

  const stats = useMemo(() => {
    const loyal = customers.filter((c) => c.billCount > 0);

    const revenue = customers.reduce(
      (sum, c) => sum + Number(c.totalSpent || 0),
      0
    );

    const top = loyal.reduce(
      (best, c) =>
        Number(c.totalSpent || 0) > Number(best?.totalSpent || 0) ? c : best,
      null
    );

    return { total: customers.length, loyal: loyal.length, revenue, top };
  }, [customers]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const saveCustomer = async (e) => {
    e.preventDefault();

    try {
      if (editing) {
        await api.put(`${API}/${editing.id}`, form);
      } else {
        await api.post(API, form);
      }

      setShowModal(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      loadCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  const editCustomer = (customer) => {
    setEditing(customer);
    setForm({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || "",
    });
    setShowModal(true);
  };

  const deleteCustomer = async (id) => {
    if (!window.confirm("Delete this customer?")) return;

    try {
      await api.delete(`${API}/${id}`);
      loadCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  const statsCards = [
    {
      label: "Total Customers",
      value: stats.total,
      emoji: "👥",
      tone: "teal",
    },
    {
      label: "Loyal (repeat buyers)",
      value: stats.loyal,
      emoji: "⭐",
      tone: "amber",
    },
    {
      label: "Customer Revenue",
      value: `₹${stats.revenue.toLocaleString()}`,
      emoji: "💰",
      tone: "emerald",
    },
    {
      label: "Top Spender",
      value: stats.top ? stats.top.name : "—",
      emoji: "🏆",
      tone: "violet",
    },
  ];

  return (
    <>
      <Sidebar />

      <div className="page-shell">
        <div className="page-header">
          <div>
            <span className="page-eyebrow">👥 Customers</span>
            <h1 className="page-title">My Customers</h1>
            <p className="page-subtitle">
              Track who buys, how often and how much they spend. ⭐
            </p>
          </div>

          <button className="btn btn-primary" onClick={openCreate}>
            ➕ Add Customer
          </button>
        </div>

        <div className="stats-grid">
          {statsCards.map((card) => (
            <div className="stat-card" key={card.label}>
              <span className={`stat-icon ${card.tone}`}>{card.icon}</span>
              <div>
                <h2 className={card.tone === "indigo" ? "stat-name" : ""}>
                  {card.value}
                </h2>
                <p>{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="toolbar">
          <div className="search-box">
            <span className="search-emoji">🔍</span>
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="tbl-card">
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Bills</th>
                  <th>Total Spent</th>
                  <th>Last Visit</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      {customers.length === 0
                        ? '👥 No customers yet. Add one, or quick-add from the Billing page.'
                        : "🔍 No customers match your search."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <div className="customer-name">
                          <span className="customer-avatar">
                            {customer.name.charAt(0).toUpperCase()}
                          </span>
                          <strong>{customer.name}</strong>
                        </div>
                      </td>
                      <td>{customer.phone || "—"}</td>
                      <td>
                        {customer.billCount > 0 ? (
                          <span className="badge badge-offline">
                            {customer.billCount}
                          </span>
                        ) : (
                          <span className="muted">No bills</span>
                        )}
                      </td>
                      <td>
                        ₹{Number(customer.totalSpent || 0).toLocaleString()}
                      </td>
                      <td>
                        {customer.lastVisit
                          ? new Date(customer.lastVisit).toLocaleDateString("en-IN", {
                              timeZone: "Asia/Kolkata",
                            })
                          : "—"}
                      </td>
                      <td>
                        <button
                          className="btn btn-soft"
                          onClick={() => editCustomer(customer)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => deleteCustomer(customer.id)}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editing ? "Edit Customer" : "Add Customer"}</h2>
            <p className="modal-hint">
              {editing
                ? "Update the customer details below."
                : "Fill in the customer information."}
            </p>

            <form onSubmit={saveCustomer}>
              <label>Customer Name</label>
              <input
                type="text"
                placeholder="e.g. Rohan Sharma"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />

              <label>Phone Number</label>
              <input
                type="text"
                placeholder="e.g. 98765 43210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />

              <label>Email (optional)</label>
              <input
                type="text"
                placeholder="e.g. rohan@gmail.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editing ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}