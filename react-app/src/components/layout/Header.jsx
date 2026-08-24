import { Link, NavLink } from "react-router-dom";
import {
  ChevronDown,
  Heart,
  LogIn,
  Search,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { useBoutiqueAuth } from "../../auth/AuthProvider";
import { getCartItemCount, useCartStore } from "../../features/cart/cartStore";
import { useAuthStore } from "../../features/auth/authStore";

export default function Header() {
  const auth = useBoutiqueAuth();
  const items = useCartStore((s) => s.items);
  const user = useAuthStore((s) => s.currentUser);
  const cartCount = getCartItemCount(items);
  const displayName =
    user?.firstName || auth.claims?.email?.split("@")[0] || "Account";
  return (
    <>
      <div className="announcement">
        Free delivery on eligible orders · Easy returns · Secure checkout
      </div>
      <header className="site-header">
        <div className="page-container header-row">
          <Link className="brand" to="/" aria-label="Boutique home">
            <img src="/static/icons/Hipster_NavLogo.svg" alt="" />
            <span>Boutique</span>
          </Link>
          <nav className="main-nav" aria-label="Main navigation">
            <NavLink to="/">Shop</NavLink>
            <a href="/#products">New arrivals</a>
            <a href="/#collections">Collections</a>
          </nav>
          <div className="header-actions">
            <a
              className="icon-action hide-mobile"
              href="/#products"
              aria-label="Search products"
            >
              <Search size={20} />
            </a>
            <span className="icon-action hide-mobile" aria-label="Wishlist">
              <Heart size={20} />
            </span>
            {auth.isAuthenticated ? (
              <Link className="account-link" to="/account">
                <UserRound size={19} />
                <span>{displayName}</span>
                <ChevronDown size={14} />
              </Link>
            ) : (
              <Link className="account-link" to="/login">
                <LogIn size={19} />
                <span>Sign in</span>
              </Link>
            )}
            <Link className="cart-link" to="/cart">
              <ShoppingBag size={21} />
              <span className="hide-mobile">Cart</span>
              {cartCount > 0 && <b>{cartCount}</b>}
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
