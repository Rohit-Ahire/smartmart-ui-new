import Navbar from "../components/Navbar";
import "./Login.css";

function Login() {
  const features = [
    "Quick Billing",
    "Inventory Management",
    "Customer Management",
    "GST Ready Invoice",
    "Razorpay Payments",
    "AWS Image Upload",
  ];

  const benefits = [
    {
      title: "Fast Billing",
      text: "Generate invoices in seconds with a smooth checkout experience.",
    },
    {
      title: "Secure Payments",
      text: "Accept online payments using Razorpay integration.",
    },
    {
      title: "Cloud Images",
      text: "Store and manage product images securely on AWS S3.",
    },
    {
      title: "Easy Reports",
      text: "View sales and customer records anytime from one dashboard.",
    },
  ];

  return (
    <>
      <Navbar />

      <section className="hero">
        <div className="hero-left">
          <h1>
            Smart Billing Software for <span>Retail Shops</span>
          </h1>

          <p>
            Manage products, customers, billing, invoices and online payments
            from one place.
          </p>

          <button className="hero-btn">Get Started</button>
        </div>

        <div className="hero-right">
          <div className="shop-card">
            <div className="shop-board">SHOP</div>

            <div className="shop-window">
              <div className="counter"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <h2>Everything You Need</h2>

        <p>
          A complete retail billing solution with inventory, payments and
          invoice generation.
        </p>

        <div className="feature-grid">
          {features.map((item, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-icon">✓</div>
              <h3>{item}</h3>
            </div>
          ))}
        </div>
      </section>

      <section className="benefits">
        <div className="benefits-header">
          <h2>Why Choose SmartMart?</h2>

          <p>
            Built for modern retail stores with speed, simplicity and security.
          </p>
        </div>

        <div className="benefits-grid">
          {benefits.map((item, index) => (
            <div className="benefit-card" key={index}>
              <div className="benefit-number">0{index + 1}</div>

              <h3>{item.title}</h3>

              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default Login;