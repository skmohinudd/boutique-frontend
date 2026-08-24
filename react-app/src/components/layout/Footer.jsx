import { Link } from "react-router-dom";
import { Camera, Mail, MapPin, ShieldCheck } from "lucide-react";
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-container footer-main">
        <div className="footer-brand">
          <Link className="brand brand--footer" to="/">
            <img src="/static/icons/Hipster_NavLogo.svg" alt="" />
            <span>Boutique</span>
          </Link>
          <p>
            Thoughtful products, simple shopping, and a checkout experience
            designed to feel effortless.
          </p>
          <div className="footer-social">
            <span>
              <Camera size={18} /> Instagram
            </span>
            <span>
              <Mail size={18} /> Support
            </span>
          </div>
        </div>
        <div>
          <h4>Shop</h4>
          <Link to="/">All products</Link>
          <a href="/#products">New arrivals</a>
          <Link to="/cart">Shopping bag</Link>
        </div>
        <div>
          <h4>My account</h4>
          <Link to="/account">Profile</Link>
          <Link to="/orders">Orders</Link>
          <Link to="/login">Sign in</Link>
        </div>
        <div>
          <h4>Customer care</h4>
          <span>
            <MapPin size={16} /> Delivery information
          </span>
          <span>
            <ShieldCheck size={16} /> Secure shopping
          </span>
          <span>Returns & refunds</span>
        </div>
      </div>
      <div className="page-container footer-bottom">
        <span>© {new Date().getFullYear()} Boutique</span>
        <span>Privacy · Terms · Accessibility</span>
      </div>
    </footer>
  );
}
