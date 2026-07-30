import { Link, NavLink } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

import {
  getCartItemCount,
  useCartStore,
} from "../../features/cart/cartStore";

function Header() {
  const items = useCartStore((state) => state.items);
  const cartCount = getCartItemCount(items);

  return (
    <header className="site-header">
      <div className="page-container site-header__content">
        <Link className="site-header__brand" to="/">
          <img
            src="/static/icons/Hipster_NavLogo.svg"
            alt="Boutique"
          />

          <span>Boutique</span>
        </Link>

        <nav
          className="site-header__navigation"
          aria-label="Main navigation"
        >
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "site-header__link site-header__link--active"
                : "site-header__link"
            }
          >
            Products
          </NavLink>

          <NavLink
            to="/cart"
            className={({ isActive }) =>
              isActive
                ? "site-header__cart site-header__link--active"
                : "site-header__cart"
            }
          >
            <ShoppingCart size={20} aria-hidden="true" />

            <span>Cart</span>

            {cartCount > 0 && (
              <span className="site-header__cart-count">
                {cartCount}
              </span>
            )}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Header;