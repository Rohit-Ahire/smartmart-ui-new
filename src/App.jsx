import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Billing from "./pages/Billing";
import Invoice from "./pages/Invoice";

function RequireLogin({ children }) {
  const user = localStorage.getItem("user");
  return user ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <RequireLogin>
              <Dashboard />
            </RequireLogin>
          }
        />

        <Route
          path="/products"
          element={
            <RequireLogin>
              <Products />
            </RequireLogin>
          }
        />

        <Route
          path="/customers"
          element={
            <RequireLogin>
              <Customers />
            </RequireLogin>
          }
        />

        <Route
          path="/billing"
          element={
            <RequireLogin>
              <Billing />
            </RequireLogin>
          }
        />

        <Route
          path="/invoice"
          element={
            <RequireLogin>
              <Invoice />
            </RequireLogin>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;