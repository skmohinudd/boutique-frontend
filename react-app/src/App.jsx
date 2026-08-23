import { Navigate, Route, Routes } from "react-router-dom";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import ProtectedRoute from "./components/auth/ProtectedRoute";
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

const protectedPage = (node) => <ProtectedRoute>{node}</ProtectedRoute>;

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
          <Route path="/profile" element={protectedPage(<ProfilePage />)} />
          <Route path="/checkout/shipping" element={protectedPage(<ShippingPage />)} />
          <Route path="/checkout/payment" element={protectedPage(<PaymentPage />)} />
          <Route path="/payment" element={<Navigate to="/checkout/payment" replace />} />
          <Route path="/orders" element={protectedPage(<OrderHistoryPage />)} />
          <Route path="/order/:orderId" element={protectedPage(<OrderDetailsPage />)} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
