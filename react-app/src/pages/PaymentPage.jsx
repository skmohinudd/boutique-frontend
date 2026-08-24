import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CreditCard, LockKeyhole, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import CheckoutStepper from "../components/checkout/CheckoutStepper";
import { createCheckout } from "../api/checkoutApi";
import { synchronizeBackendCart } from "../api/cartApi";
import { getCartTotal, useCartStore } from "../features/cart/cartStore";
import { useAuthStore } from "../features/auth/authStore";
import { useShippingStore } from "../features/checkout/shippingStore";
import { useOrderStore } from "../features/orders/orderStore";
const TEST_CARDS = [
  { last4: "4242", label: "Approve" },
  { last4: "0000", label: "Decline" },
  { last4: "9999", label: "Timeout" },
];
export default function PaymentPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.currentUser);
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const shipping = useShippingStore((s) => s.address);
  const recordOrder = useOrderStore((s) => s.recordOrder);
  const [last4, setLast4] = useState("4242");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const total = useMemo(() => getCartTotal(items), [items]);
  const currency = items[0]?.currency || "USD";
  useEffect(() => {
    if (!shipping?.addressLine1 && items.length)
      navigate("/checkout/shipping", { replace: true });
  }, [shipping?.addressLine1, items.length, navigate]);
  if (!items.length)
    return (
      <main className="center-state">
        <h1>Your cart is empty</h1>
        <p>Add a product before continuing to payment.</p>
        <Link className="primary-button" to="/">
          Shop products
        </Link>
      </main>
    );
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await synchronizeBackendCart(user?.id, items);
      const result = await createCheckout({
        userId: user?.id,
        cardLast4: last4,
      });
      if (result.status !== "CONFIRMED")
        throw new Error(`Checkout status: ${result.status}`);
      recordOrder({
        ...result,
        userId: user.id,
        email: user.email,
        items,
        total,
        shipping,
        createdAt: new Date().toISOString(),
      });
      clearCart();
      toast.success("Your order is confirmed");
      navigate(`/order/${result.orderId}`, {
        state: { justConfirmed: true },
        replace: true,
      });
    } catch (ex) {
      const message =
        ex?.data?.detail ||
        ex?.data?.message ||
        ex?.message ||
        "Payment could not be completed";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="page-container checkout-page">
      <CheckoutStepper active="Payment" />
      <header className="checkout-heading">
        <span className="eyebrow">PAYMENT</span>
        <h1>Review and place your order</h1>
        <p>Check your delivery details and choose a test payment outcome.</p>
      </header>
      <div className="payment-grid">
        <form className="checkout-card payment-card" onSubmit={submit}>
          <div className="checkout-card-title">
            <CreditCard />
            <div>
              <h2>Payment</h2>
              <p>This environment uses a safe payment simulation.</p>
            </div>
          </div>
          <label>
            Cardholder
            <input
              value={`${user?.firstName || ""} ${user?.lastName || ""}`.trim()}
              readOnly
            />
          </label>
          <label>
            Card
            <input value={`•••• •••• •••• ${last4}`} readOnly />
          </label>
          <div className="payment-two">
            <label>
              Expiry
              <input value="12/30" readOnly />
            </label>
            <label>
              Security code
              <input value="123" type="password" readOnly />
            </label>
          </div>
          <div className="payment-options">
            {TEST_CARDS.map((c) => (
              <button
                type="button"
                className={last4 === c.last4 ? "active" : ""}
                key={c.last4}
                onClick={() => setLast4(c.last4)}
              >
                <strong>{c.label}</strong>
                <span>•••• {c.last4}</span>
              </button>
            ))}
          </div>
          {error && <p className="payment-error">{error}</p>}
          <button className="checkout-button" disabled={busy}>
            <LockKeyhole size={18} />
            {busy
              ? "Placing order…"
              : `Place order · ${new Intl.NumberFormat("en-US", { style: "currency", currency }).format(total)}`}
          </button>
          <p className="payment-safe">
            <ShieldCheck size={16} /> Do not enter a real card number in this
            test environment.
          </p>
        </form>
        <aside className="order-summary">
          <h2>Order summary</h2>
          {items.map((item) => (
            <div key={item.productId}>
              <span>
                {item.name} × {item.quantity}
              </span>
              <strong>
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency,
                }).format(Number(item.price) * item.quantity)}
              </strong>
            </div>
          ))}
          <hr />
          <div className="summary-total">
            <span>Total</span>
            <strong>
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency,
              }).format(total)}
            </strong>
          </div>
          <div className="delivery-summary">
            <strong>Deliver to</strong>
            <span>{shipping.fullName}</span>
            <span>
              {shipping.addressLine1}
              {shipping.addressLine2 ? `, ${shipping.addressLine2}` : ""}
            </span>
            <span>
              {shipping.city}, {shipping.state} {shipping.postalCode}
            </span>
            <Link to="/checkout/shipping">Edit delivery details</Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
