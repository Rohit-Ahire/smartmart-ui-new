import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "./Invoice.css";

const API = "http://localhost:8080/api/bills";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const res = await axios.get(API);
      setInvoices(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const downloadPdf = (id) => {
    window.open(`${API}/${id}/pdf`, "_blank");
  };

  return (
    <>
      <Sidebar />

      <div className="page-content">
        <div className="invoices-page">
          <h1>Invoices</h1>
          <p>View and download generated invoices.</p>

          <div className="invoice-card">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-row">
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td>#{invoice.id}</td>
                      <td>{invoice.customerName}</td>
                      <td>₹{invoice.totalAmount}</td>
                      <td>
                        {invoice.createdAt
                          ? new Date(invoice.createdAt).toLocaleString()
                          : "-"}
                      </td>
                      <td>
                        <button
                          className="download-btn"
                          onClick={() => downloadPdf(invoice.id)}
                        >
                          Download PDF
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
    </>
  );
}