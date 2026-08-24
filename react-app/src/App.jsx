import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import CartPage from "./pages/CartPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import ShippingPage from "./pages/ShippingPage";
import PaymentPage from "./pages/PaymentPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import LogoutPage from "./pages/LogoutPage";
import NotFoundPage from "./pages/NotFoundPage";

const secure = (node) => <ProtectedRoute>{node}</ProtectedRoute>;
export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <div className="app-shell__content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:productId" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/account" element={secure(<ProfilePage />)} />
          <Route path="/profile" element={<Navigate to="/account" replace />} />
          <Route path="/checkout/shipping" element={secure(<ShippingPage />)} />
          <Route path="/checkout/payment" element={secure(<PaymentPage />)} />
          <Route
            path="/payment"
            element={<Navigate to="/checkout/payment" replace />}
          />
          <Route path="/orders" element={secure(<OrderHistoryPage />)} />
          <Route
            path="/order/:orderId"
            element={secure(<OrderDetailsPage />)}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
