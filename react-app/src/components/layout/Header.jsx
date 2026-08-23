import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, ShoppingCart, UserRound, PackageSearch } from "lucide-react";
import { getCartItemCount, useCartStore } from "../../features/cart/cartStore";
import { useAuthStore } from "../../features/auth/authStore";

export default function Header() {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const cartCount = getCartItemCount(items);
  const user = useAuthStore((state) => state.currentUser);
  const logout = useAuthStore((state) => state.logout);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="site-header">
      <div className="page-container site-header__content">
        <Link className="site-header__brand" to="/"><img src="/static/icons/Hipster_NavLogo.svg" alt="Boutique" /><span>Boutique</span></Link>
        <nav className="site-header__navigation" aria-label="Main navigation">
          <NavLink to="/" className="site-header__link"><PackageSearch size={17}/> Products</NavLink>
          {user ? <>
            <NavLink to="/orders" className="site-header__link">Orders</NavLink>
            <NavLink to="/profile" className="site-header__account"><UserRound size={18}/><span>{user.firstName}</span></NavLink>
            <button type="button" className="header-logout" onClick={handleLogout}><LogOut size={17}/> Logout</button>
          </> : <>
            <NavLink to="/login" className="site-header__link">Sign in</NavLink>
            <NavLink to="/signup" className="header-register">Create account</NavLink>
          </>}
          <NavLink to="/cart" className="site-header__cart"><ShoppingCart size={20}/><span>Cart</span>{cartCount > 0 && <span className="site-header__cart-count">{cartCount}</span>}</NavLink>
        </nav>
      </div>
    </header>
  );
}
