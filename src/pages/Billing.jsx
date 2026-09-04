import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "./Billing.css";

const API = "http://localhost:8080/api";

function Billing() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API}/products`);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load products.");
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);

      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }

      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const increaseQty = (id) => {
    setCart((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, quantity: i.quantity + 1 } : i
      )
    );
  };

  const decreaseQty = (id) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.id === id ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
      ),
    [cart]
  );

  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  const handlePayment = async () => {
    if (!customerName.trim()) {
      alert("Enter customer name.");
      return;
    }

    if (cart.length === 0) {
      alert("Cart is empty.");
      return;
    }

    try {
      // Create bill first
      const billRes = await axios.post(`${API}/bills`, {
        customerName,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      });

      const bill = billRes.data;
      console.log("Bill Response:", bill);

      // Create Razorpay order
      const orderRes = await axios.post(`${API}/payment/create-order`, {
        billId: bill.id,
      });

      const order = orderRes.data;

      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: "SmartMart POS",
        description: `Bill #${bill.id}`,
        order_id: order.orderId,

        handler: async function (response) {
          try {
            await axios.post(`${API}/payment/verify`, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            alert("Payment Successful!");

            setCart([]);
            setCustomerName("");
            fetchProducts();
          } catch (err) {
            console.error(err);
            alert("Payment verification failed.");
          }
        },

        prefill: {
          name: customerName,
        },

        theme: {
          color: "#2d5cff",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error(err);
      alert("Unable to start payment.");
    }
  };

  return (
    <div className="billing-page">
      <Sidebar />

      <div className="billing-content">
        <h1>Billing</h1>
        <p>Create customer bills quickly.</p>

        <div className="billing-layout">
          <div className="products-section">
            <input
              type="text"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />

            <input
              type="text"
              placeholder="Search Products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="products-grid">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="product-card"
                  onClick={() => addToCart(product)}
                >
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}

                  <h3>{product.name}</h3>
                  <p>₹{product.price}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="cart-section">
            <h2>Cart</h2>

            {cart.length === 0 ? (
              <p>No items</p>
            ) : (
              <>
                {cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <p>₹{item.price}</p>
                    </div>

                    <div className="qty-controls">
                      <button onClick={() => decreaseQty(item.id)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => increaseQty(item.id)}>+</button>
                    </div>
                  </div>
                ))}

                <div className="cart-summary">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="summary-row">
                    <span>GST (18%)</span>
                    <span>₹{gst.toFixed(2)}</span>
                  </div>

                  <div className="total-row">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>

                  <button className="pay-btn" onClick={handlePayment}>
                    Pay with Razorpay
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Billing;