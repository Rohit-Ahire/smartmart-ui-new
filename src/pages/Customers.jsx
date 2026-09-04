import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "./Customers.css";

const API = "http://localhost:8080/api/customers";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const res = await axios.get(API);
      setCustomers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const saveCustomer = async (e) => {
    e.preventDefault();

    try {
      if (editing) {
        await axios.put(`${API}/${editing.id}`, form);
      } else {
        await axios.post(API, form);
      }

      setShowModal(false);
      setEditing(null);
      setForm({ name: "", phone: "" });
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
    });
    setShowModal(true);
  };

  const deleteCustomer = async (id) => {
    if (!window.confirm("Delete this customer?")) return;

    try {
      await axios.delete(`${API}/${id}`);
      loadCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Sidebar />

      <div className="page-content">
        <div className="customers-page">
          <div className="customers-header">
            <div>
              <h1>Customers</h1>
              <p>Manage all your customers.</p>
            </div>

            <button
              className="add-btn"
              onClick={() => {
                setEditing(null);
                setForm({ name: "", phone: "" });
                setShowModal(true);
              }}
            >
              + Add Customer
            </button>
          </div>

          <div className="customers-card">
            <table className="customers-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty">
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.id}</td>
                      <td>{customer.name}</td>
                      <td>{customer.phone}</td>
                      <td>
                        <button
                          className="edit-btn"
                          onClick={() => editCustomer(customer)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => deleteCustomer(customer.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h2>{editing ? "Edit Customer" : "Add Customer"}</h2>

              <form onSubmit={saveCustomer}>
                <input
                  placeholder="Customer Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  required
                />

                <input
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  required
                />

                <div className="modal-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="save-btn">
                    {editing ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}