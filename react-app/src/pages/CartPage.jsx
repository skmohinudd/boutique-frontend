import { Minus, Plus, Trash2, ShieldCheck, Truck, BellRing } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import CheckoutStepper from "../components/checkout/CheckoutStepper";
import { formatPrice, PRODUCT_PLACEHOLDER_IMAGE, resolveImageUrl } from "../components/product/ProductCard";
import { getCartTotal, useCartStore } from "../features/cart/cartStore";
import { useAuthStore } from "../features/auth/authStore";

export default function CartPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.currentUser);
  const items = useCartStore((s) => s.items);
  const increaseQuantity = useCartStore((s) => s.increaseQuantity);
  const decreaseQuantity = useCartStore((s) => s.decreaseQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const total = getCartTotal(items);
  const currency = items[0]?.currency || "USD";

  if (!items.length) {
    return (
      <main className="page-container cart-page">
        <div className="empty-state polished-empty">
          <div className="empty-state__icon">🛍️</div>
          <h1>Your cart is ready for something beautiful.</h1>
          <p>Browse the live catalogue and add products to begin checkout.</p>
          <Link className="primary-link" to="/">Continue shopping</Link>
        </div>
      </main>
    );
  }

  function checkout() {
    if (!user) {
      navigate("/login", { state: { from: "/checkout/shipping" } });
      return;
    }
    navigate("/checkout/shipping");
  }

  return (
    <main className="page-container cart-page">
      <CheckoutStepper active="Cart" />
      <div className="cart-page__heading">
        <div><p className="section-heading__eyebrow">Shopping cart</p><h1>Your items</h1></div>
        <button className="cart-page__clear" onClick={clearCart}>Clear cart</button>
      </div>
      <div className="cart-layout">
        <section className="cart-items">
          {items.map((item) => (
            <article className="cart-item" key={item.productId}>
              <img src={resolveImageUrl(item.imageUrl)} alt={item.name} onError={(e) => {
                if (!e.currentTarget.src.endsWith("/product-placeholder.svg")) e.currentTarget.src = PRODUCT_PLACEHOLDER_IMAGE;
              }} />
              <div className="cart-item__content">
                <Link className="cart-item__name" to={`/product/${encodeURIComponent(item.productId)}`}>{item.name}</Link>
                <p>{formatPrice(item.price, item.currency)}</p>
                <div className="cart-item__controls">
                  <button aria-label={`Decrease ${item.name}`} onClick={() => decreaseQuantity(item.productId)}><Minus size={16} /></button>
                  <span>{item.quantity}</span>
                  <button aria-label={`Increase ${item.name}`} disabled={item.quantity >= item.availableQuantity} onClick={() => increaseQuantity(item.productId)}><Plus size={16} /></button>
                </div>
              </div>
              <div className="cart-item__aside">
                <strong>{formatPrice(item.price * item.quantity, item.currency)}</strong>
                <button aria-label={`Remove ${item.name}`} className="cart-item__remove" onClick={() => removeItem(item.productId)}><Trash2 size={18} /></button>
              </div>
            </article>
          ))}
        </section>
        <aside className="cart-summary">
          <h2>Order summary</h2>
          <div className="cart-summary__row"><span>Subtotal</span><strong>{formatPrice(total, currency)}</strong></div>
          <div className="checkout-benefits">
            <span><ShieldCheck size={17}/> Inventory validated at checkout</span>
            <span><Truck size={17}/> Shipping created after confirmation</span>
            <span><BellRing size={17}/> Event-driven confirmation notification</span>
          </div>
          {!user && <p className="signin-hint">Sign in first so the order, payment, shipping and notification belong to your account.</p>}
          <button className="checkout-main" onClick={checkout}>{user ? "Continue to shipping" : "Sign in to checkout"}</button>
          <p className="microcopy">Your cart is cleared only after a successful confirmed checkout.</p>
        </aside>
      </div>
    </main>
  );
}
