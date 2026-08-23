import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-container footer-grid">
        <div><h3>Boutique</h3><p>Cloud-native shopping powered by Kubernetes microservices.</p></div>
        <div><h4>Shop</h4><Link to="/">Products</Link><Link to="/cart">Cart</Link></div>
        <div><h4>Account</h4><Link to="/login">Sign in</Link><Link to="/signup">Register</Link><Link to="/orders">Orders</Link></div>
        <div><h4>Platform</h4><p>Secure checkout</p><p>Live inventory</p><p>Event-driven notifications</p></div>
      </div>
      <div className="page-container footer-bottom">© {new Date().getFullYear()} Boutique • DEV commerce platform</div>
    </footer>
  );
}

