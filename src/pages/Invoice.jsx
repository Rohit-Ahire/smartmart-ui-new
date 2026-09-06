import { useEffect, useState } from "react";
import { FaDownload } from "react-icons/fa";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import "./Invoice.css";
import "./shared.css";

const API = "/bills";

function formatIST(iso) {
  if (!iso) return "-";

  const d = new Date(iso);

  const time = d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

  const date = d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  return `${time} · ${date}`;
}

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);

  async function loadInvoices() {
    try {
      const res = await api.get(API);
      setInvoices(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadInvoices();
  }, []);

  const downloadPdf = async (id) => {
    try {
      const res = await api.get(`/bills/${id}/pdf`, {
        responseType: "blob",
      });

      const url = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Could not download the PDF. Please try again.");
    }
  };

  return (
    <>
      <Sidebar />

      <div className="page-shell">
        <div className="page-header">
          <div>
            <span className="page-eyebrow">🧾 Bills & Invoices</span>
            <h1 className="page-title">Invoices</h1>
            <p className="page-subtitle">
              View all generated bills and download PDF invoices.
            </p>
          </div>
        </div>

        <div className="tbl-card">
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      No invoices yet. Generate one from the Billing page.
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td>#{invoice.id}</td>
                      <td>{invoice.customerName}</td>
                      <td>₹{invoice.totalAmount}</td>
                      <td>
                        <span
                          className={
                            invoice.paymentStatus === "PAID"
                              ? "badge badge-paid"
                              : "badge badge-pending"
                          }
                        >
                          {invoice.paymentStatus || "PENDING"}
                        </span>
                      </td>
                      <td>
                        {formatIST(invoice.createdAt)}
                      </td>
                      <td>
                        <button
                          className="btn btn-primary"
                          onClick={() => downloadPdf(invoice.id)}
                        >
                          <FaDownload /> PDF
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