import { useEffect, useMemo, useState } from "react";
import { FaMoneyBillWave, FaCreditCard } from "react-icons/fa";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import "./Billing.css";
import "./shared.css";

const BILL_API = "/bills";

function Billing() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [walkInName, setWalkInName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cart, setCart] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "" });
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [pendingBills, setPendingBills] = useState([]);
  const [retryBill, setRetryBill] = useState(null);

  useEffect(() => {
    fetchProducts();
    loadCustomers();
    loadPendingBills();
  }, []);

  async function fetchProducts() {
    try {
      const res = await api.get("/products");
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load products.");
    }
  }

  async function loadPendingBills() {
    try {
      const res = await api.get(BILL_API);
      const pending = (res.data || []).filter(
        (b) => (b.paymentStatus || "").toUpperCase() !== "PAID"
      );
      setPendingBills(pending);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadCustomers() {
    try {
      const res = await api.get("/customers");
      setCustomers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const addToCart = (product) => {
    if (product.quantity <= 0) {
      alert("Product out of stock.");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);

      if (existing) {
        if (existing.quantity >= product.quantity) {
          alert("Maximum available stock reached.");
          return prev;
        }
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }

      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const increaseQty = (id) => {
    setCart((prev) => {
      const product = products.find((p) => p.id === id);
      const current = prev.find((i) => i.id === id);

      if (current && product && current.quantity >= product.quantity) {
        alert("Maximum available stock reached.");
        return prev;
      }

      return prev.map((i) =>
        i.id === id ? { ...i, quantity: i.quantity + 1 } : i
      );
    });
  };

  const decreaseQty = (id) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const subtotal = useMemo(
    () =>
      cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
    [cart]
  );

  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  const resetAfterBill = () => {
    setCart([]);
    setWalkInName("");
    setCustomerId("");
    fetchProducts();
    loadPendingBills();
  };

  const addNewCustomer = async (e) => {
    e.preventDefault();

    if (!newCustomer.name.trim()) return;

    setSavingCustomer(true);

    try {
      const res = await api.post("/customers", {
        name: newCustomer.name.trim(),
        phone: newCustomer.phone.trim(),
      });

      setCustomers((prev) => [...prev, res.data]);
      setCustomerId(res.data.id);
      setShowCustomerModal(false);
      setNewCustomer({ name: "", phone: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to add customer");
    } finally {
      setSavingCustomer(false);
    }
  };

  const openRazorpay = (bill, order) => {
    return new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        reject(new Error("Payment gateway is unavailable right now."));
        return;
      }

      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: "SmartMart POS",
        description: `Bill #${bill.id} - ${bill.customerName}`,
        order_id: order.orderId,
        prefill: {
          name: bill.customerName,
        },
        theme: { color: "#059669" },
        handler: async (response) => {
          try {
            await api.post("/payment/verify", {
              billId: bill.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            resolve(response);
          } catch (err) {
            reject(err);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            reject(new Error("Payment window closed"));
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (res) => {
        reject(new Error(res.error?.description || "Payment failed"));
      });

      rzp.open();
    });
  };

  const getPaymentErrorMessage = (payErr) => {
    const isAxios = !!payErr?.isAxiosError;

    if (payErr?.response?.status >= 500) {
      return "Payment server is not working. Please try again later.";
    }
    if (isAxios && !payErr.response) {
      return "Payment server is not responding. Please check your connection and try again.";
    }
    if (isAxios) {
      const data = payErr.response?.data;
      if (data?.status === "failed") return "Payment verification failed.";
      return data?.message || data?.error || "Payment could not be completed.";
    }
    if (payErr?.message === "Payment window closed") {
      return "Payment was cancelled.";
    }
    return payErr?.message || "Payment could not be completed.";
  };

  const retryCash = async (bill) => {
    setProcessing(true);
    try {
      await api.put(`${BILL_API}/${bill.id}/pay`);
      alert(`Bill #${bill.id} marked as PAID (Cash).`);
      setRetryBill(null);
      loadPendingBills();
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          "Could not mark the bill as paid. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  const retryOnline = async (bill) => {
    setProcessing(true);
    try {
      const order = await api.post("/payment/create-order", {
        billId: bill.id,
      });

      await openRazorpay(bill, order.data);

      alert(`Payment successful!\nBill #${bill.id} - Rs. ${bill.totalAmount}`);
      setRetryBill(null);
      loadPendingBills();
    } catch (payErr) {
      console.error(payErr);
      const message = getPaymentErrorMessage(payErr);
      alert(
        `${message}\n\nBill #${bill.id} was NOT marked as paid. It is still UNPAID and can be retried.`
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleBill = async () => {
    if (cart.length === 0) {
      alert("Cart is empty.");
      return;
    }

    setProcessing(true);

    try {
      const cid = customerId ? Number(customerId) : null;
      const chosen =
        cid != null ? customers.find((c) => c.id === cid) : null;

      const billRequest = {
        customerName: chosen
          ? chosen.name
          : walkInName.trim() || "Walk-in Customer",
        paymentMethod: paymentMethod.toUpperCase(),
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };

      if (cid != null) {
        billRequest.customerId = cid;
      }

      const res = await api.post(BILL_API, billRequest);

      const bill = res.data;

      if (paymentMethod === "cash") {
        await api.put(`${BILL_API}/${bill.id}/pay`);
        alert(
          `Bill #${bill.id} created!\nTotal: Rs. ${bill.totalAmount} (Cash)`
        );
        resetAfterBill();
        return;
      }

      try {
        const order = await api.post("/payment/create-order", {
          billId: bill.id,
        });

        await openRazorpay(bill, order.data);

        alert(
          `Payment successful!\nBill #${bill.id} - Rs. ${bill.totalAmount}`
        );
        resetAfterBill();
      } catch (payErr) {
        console.error(payErr);

        const message = getPaymentErrorMessage(payErr);

        alert(
          `${message}\n\nBill #${bill.id} was NOT marked as paid. It is saved as UNPAID and can be retried.`
        );
        resetAfterBill();
      }
    } catch (err) {
      console.error(err);
      const reason =
        err.response?.data?.message || "Unable to create bill. Check stock and try again.";
      alert(reason);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="billing-page">
      <Sidebar />

      <div className="page-shell">
        <div className="page-header">
          <div>
            <span className="page-eyebrow">Point of Sale</span>
            <h1 className="page-title">Cart</h1>
            <p className="page-subtitle">
              Pick products, choose a payment method and generate instant bills.
            </p>
          </div>
        </div>

        {pendingBills.length > 0 && (
          <div className="pending-panel">
            <div className="pending-panel-head">
              <h3>
                Pending Payments <span>{pendingBills.length}</span>
              </h3>
              <p>These bills are not paid yet. Click a bill to retry the payment.</p>
            </div>

            <div className="pending-list">
              {pendingBills.map((b) => (
                <button
                  type="button"
                  key={b.id}
                  className="pending-item"
                  onClick={() => setRetryBill(b)}
                >
                  <span className="pending-id">#{b.id}</span>
                  <span className="pending-customer">{b.customerName}</span>
                  <span className="pending-amount">
                    Rs. {Number(b.totalAmount).toFixed(2)}
                  </span>
                  <span className="pending-badge">Unpaid</span>
                  <span className="pending-retry">Retry Payment</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="billing-layout">
          <div className="products-section">
            <div className="customer-field">
              <label htmlFor="customerId">Customer</label>

              <div className="customer-pick-row">
                <select
                  id="customerId"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                >
                  <option value="">Walk-in Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.phone ? `  (${c.phone})` : ""}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="new-customer-btn"
                  onClick={() => setShowCustomerModal(true)}
                >
                  + New
                </button>
              </div>

              {customerId ? (
                <p className="selected-customer">
                  Billing for <strong>{customers.find((c) => c.id === Number(customerId))?.name}</strong>
                  <span>
                    {customers.find((c) => c.id === Number(customerId))?.billCount
                      ? ` · ${customers.find((c) => c.id === Number(customerId)).billCount} bills so far`
                      : " · first visit"}
                  </span>
                </p>
              ) : (
                <input
                  type="text"
                  placeholder="Walk-in customer name (optional)"
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                />
              )}
            </div>

            <input
              className="search-field"
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="products-grid">
              {filteredProducts.length === 0 && (
                <div className="no-products">No products found.</div>
              )}

              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="product-card"
                  onClick={() => addToCart(product)}
                  title="Click to add to cart"
                >
                  <h3>{product.name}</h3>
                  <p className="product-price">₹ {product.price}</p>
                  <span
                    className={
                      product.quantity > 0
                        ? "stock-badge"
                        : "stock-badge out-stock"
                    }
                  >
                    {product.quantity > 0
                      ? `${product.quantity} in stock`
                      : "Out of stock"}
                  </span>
                  <button
                    type="button"
                    className="add-to-cart-btn"
                    disabled={product.quantity <= 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="cart-section">
            <h2>Cart</h2>

            {cart.length === 0 ? (
              <p className="cart-empty">
                No items yet. Click a product to add it here.
              </p>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <div className="cart-item-info">
                        <h4>{item.name}</h4>
                        <p>
                          Rs. {item.price} × {item.quantity}
                        </p>
                      </div>

                      <div className="qty-controls">
                        <button onClick={() => decreaseQty(item.id)}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => increaseQty(item.id)}>+</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-summary">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>Rs. {subtotal.toFixed(2)}</span>
                  </div>

                  <div className="summary-row">
                    <span>GST (18%)</span>
                    <span>Rs. {gst.toFixed(2)}</span>
                  </div>

                  <div className="total-row">
                    <span>Total</span>
                    <span>Rs. {total.toFixed(2)}</span>
                  </div>

                  <div className="payment-methods">
                    <button
                      type="button"
                      className={
                        paymentMethod === "cash"
                          ? "pay-mode active-cash"
                          : "pay-mode"
                      }
                      onClick={() => setPaymentMethod("cash")}
                    >
                      <FaMoneyBillWave />
                      <span>Cash</span>
                    </button>
                    <button
                      type="button"
                      className={
                        paymentMethod === "online"
                          ? "pay-mode active-online"
                          : "pay-mode"
                      }
                      onClick={() => setPaymentMethod("online")}
                    >
                      <FaCreditCard />
                      <span>Card / UPI</span>
                    </button>
                  </div>

                  <button
                    className={
                      paymentMethod === "cash" ? "pay-btn cash" : "pay-btn"
                    }
                    onClick={handleBill}
                    disabled={processing}
                  >
                    {processing
                      ? "Processing..."
                      : paymentMethod === "cash"
                        ? `Collect Cash Rs. ${total.toFixed(2)}`
                        : `Pay Online Rs. ${total.toFixed(2)}`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {retryBill && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Retry Payment</h2>
            <p className="modal-hint">
              Bill #{retryBill.id} · {retryBill.customerName}
              <br />
              Amount: Rs. {Number(retryBill.totalAmount).toFixed(2)}
            </p>

            <div className="retry-options">
              <button
                type="button"
                className="retry-option cash"
                disabled={processing}
                onClick={() => retryCash(retryBill)}
              >
                <FaMoneyBillWave />
                <span>Pay by Cash</span>
                <small>Collect cash for this bill</small>
              </button>

              <button
                type="button"
                className="retry-option online"
                disabled={processing}
                onClick={() => retryOnline(retryBill)}
              >
                <FaCreditCard />
                <span>Pay Online</span>
                <small>Card / UPI via Razorpay</small>
              </button>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setRetryBill(null)}
                disabled={processing}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showCustomerModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>New Customer</h2>
            <p className="modal-hint">
              Save this customer to track their bills and spend.
            </p>

            <form onSubmit={addNewCustomer}>
              <label>Customer Name</label>
              <input
                type="text"
                placeholder="e.g. Aman Verma"
                value={newCustomer.name}
                onChange={(e) =>
                  setNewCustomer((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                required
              />

              <label>Phone Number</label>
              <input
                type="text"
                placeholder="e.g. 98765 43210"
                value={newCustomer.phone}
                onChange={(e) =>
                  setNewCustomer((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowCustomerModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingCustomer}
                >
                  {savingCustomer ? "Saving..." : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Billing;