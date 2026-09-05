# SmartMart — Frontend (React + Vite)

Responsive retail POS dashboard for SmartMart. Builds bills with 18% GST,
accepts **Cash** or **online payment via Razorpay**, tracks customers, products
and invoices, with a lightweight admin UI.

---

## Tech Stack

| Layer        | Technology                                             |
| ------------ | ------------------------------------------------------ |
| Framework    | React 19 (function components + hooks)                 |
| Build tool   | Vite                                                   |
| Routing      | React Router (protected routes via `RequireLogin`)     |
| HTTP client  | Axios (`src/services/api.js`)                          |
| Icons        | react-icons (Font Awesome)                             |
| Payments     | Razorpay Checkout (test mode)                          |
| Linting      | ESLint (flat config)                                   |

---

## Project Structure

```
src/
├── main.jsx               # app entry
├── App.jsx                # routes + login guard
├── components/
│   └── Sidebar.{jsx,css}  # app shell navigation (icons + user)
├── pages/
│   ├── Login.{jsx,css}    # auth screen
│   ├── Dashboard.{jsx,css}  # stats, greeting, recent bills
│   ├── Products.{jsx,css}   # inventory CRUD + image upload
│   ├── Customers.{jsx,css}  # CRM: spend/bills/last-visit
│   ├── Billing.{jsx,css}    # POS: cart, GST, Cash/Razorpay
│   ├── Invoice.{jsx,css}    # invoices + PDF download
│   └── shared.css           # shared design system
└── services/
    └── api.js            # axios instance (baseURL http://localhost:8080/api)
```

---

## Payment Flow (Razorpay)

1. Create a bill → backend stores it as `PENDING`.
2. **Cash** → frontend calls `PUT /bills/{id}/pay` → bill becomes `PAID`.
3. **Card / UPI** → frontend requests a Razorpay order
   (`POST /payment/create-order`) and opens the Razorpay Checkout.
4. On success frontend calls `POST /payment/verify` with the signed response;
   backend verifies the HMAC-SHA256 signature and marks the bill `PAID`.
5. Any online-payment failure offers a cash fallback so billing never dead-ends.

Razorpay checkout script is loaded in `index.html`, keys are served to the
browser from the backend (test key id only — the secret never leaves the server).

---

## Scripts

```bash
npm install        # first time
npm run dev        # dev server  → http://localhost:5173
npm run lint       # eslint
npm run build      # production build → dist/
npm run preview    # preview production build
```

## Default Login

```
username: admin
password: admin123
```

## Local Development

The backend must be running on `http://localhost:8080` (Spring Boot). See the
backend `README.md` for setup. CORS is configured to allow `http://localhost:5173`.