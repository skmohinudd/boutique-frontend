import {
  Minus,
  Plus,
  Trash2,
  ShieldCheck,
  Truck,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import CheckoutStepper from "../components/checkout/CheckoutStepper";
import ProductGrid from "../components/product/ProductGrid";
import {
  formatPrice,
  PRODUCT_PLACEHOLDER_IMAGE,
  resolveImageUrl,
} from "../components/product/ProductCard";
import { getCartTotal, useCartStore } from "../features/cart/cartStore";
import { useProducts } from "../features/products/useProducts";
import { useBoutiqueAuth } from "../auth/AuthProvider";

function EmptyCart() {
  const { data } = useProducts({ page: 0, size: 4 });
  const products = data?.content || [];
  return (
    <main>
      <section className="empty-cart">
        <div className="empty-cart-icon">
          <ShoppingBag size={36} />
        </div>
        <span className="eyebrow">YOUR BAG</span>
        <h1>Your cart is empty</h1>
        <p>You haven’t added anything yet. Discover something worth keeping.</p>
        <a className="primary-button" href="/#products">
          Start shopping <ArrowRight size={18} />
        </a>
      </section>
      {products.length > 0 && (
        <section className="page-container cart-recommendations">
          <div className="section-heading">
            <div>
              <span className="eyebrow">YOU MAY LIKE</span>
              <h2>Popular right now</h2>
            </div>
          </div>
          <ProductGrid products={products} />
        </section>
      )}
    </main>
  );
}
export default function CartPage() {
  const navigate = useNavigate();
  const auth = useBoutiqueAuth();
  const items = useCartStore((s) => s.items);
  const increaseQuantity = useCartStore((s) => s.increaseQuantity);
  const decreaseQuantity = useCartStore((s) => s.decreaseQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const total = getCartTotal(items);
  const currency = items[0]?.currency || "USD";
  if (!items.length) return <EmptyCart />;
  function checkout() {
    if (!auth.isAuthenticated) {
      navigate("/login", { state: { from: "/checkout/shipping" } });
      return;
    }
    navigate("/checkout/shipping");
  }
  return (
    <main className="page-container cart-page">
      <CheckoutStepper active="Cart" />
      <div className="cart-heading">
        <div>
          <span className="eyebrow">SHOPPING BAG</span>
          <h1>Your cart</h1>
          <p>
            {items.reduce((n, i) => n + i.quantity, 0)} item(s) ready for
            checkout
          </p>
        </div>
        <button className="link-button danger" onClick={clearCart}>
          Clear cart
        </button>
      </div>
      <div className="cart-layout">
        <section className="cart-items">
          {items.map((item) => (
            <article className="cart-item" key={item.productId}>
              <img
                src={resolveImageUrl(item.imageUrl)}
                alt={item.name}
                onError={(e) => {
                  if (!e.currentTarget.src.endsWith("/product-placeholder.svg"))
                    e.currentTarget.src = PRODUCT_PLACEHOLDER_IMAGE;
                }}
              />
              <div className="cart-item-info">
                <Link to={`/product/${encodeURIComponent(item.productId)}`}>
                  {item.name}
                </Link>
                <span>{formatPrice(item.price, item.currency)}</span>
                <div className="qty-control">
                  <button
                    aria-label="Decrease quantity"
                    onClick={() => decreaseQuantity(item.productId)}
                  >
                    <Minus size={15} />
                  </button>
                  <b>{item.quantity}</b>
                  <button
                    aria-label="Increase quantity"
                    disabled={item.quantity >= item.availableQuantity}
                    onClick={() => increaseQuantity(item.productId)}
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
              <div className="cart-item-end">
                <strong>
                  {formatPrice(item.price * item.quantity, item.currency)}
                </strong>
                <button
                  className="remove-button"
                  onClick={() => removeItem(item.productId)}
                >
                  <Trash2 size={18} />
                  <span>Remove</span>
                </button>
              </div>
            </article>
          ))}
        </section>
        <aside className="cart-summary">
          <h2>Order summary</h2>
          <div>
            <span>Subtotal</span>
            <strong>{formatPrice(total, currency)}</strong>
          </div>
          <div>
            <span>Delivery</span>
            <strong>Calculated next</strong>
          </div>
          <hr />
          <div className="cart-total">
            <span>Total</span>
            <strong>{formatPrice(total, currency)}</strong>
          </div>
          <button className="checkout-button" onClick={checkout}>
            {auth.isAuthenticated
              ? "Continue to checkout"
              : "Sign in to checkout"}
            <ArrowRight size={18} />
          </button>
          <div className="cart-assurance">
            <span>
              <ShieldCheck /> Secure account checkout
            </span>
            <span>
              <Truck /> Delivery details confirmed before payment
            </span>
          </div>
        </aside>
      </div>
    </main>
  );
}
