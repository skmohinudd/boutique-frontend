import { Navigate, Route, Routes } from "react-router-dom";

import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import CartPage from "./pages/CartPage";
import HomePage from "./pages/HomePage";
import ProductDetailsPage from "./pages/ProductDetailsPage";

function App() {
  return (
    <div className="app-shell">
      <Header />

      <div className="app-shell__content">
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route
            path="/product/:productId"
            element={<ProductDetailsPage />}
          />

          <Route path="/cart" element={<CartPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;