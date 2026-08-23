import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CheckoutStepper from "../components/checkout/CheckoutStepper";
import { createCheckout } from "../api/checkoutApi";
import { synchronizeBackendCart } from "../api/cartApi";
import { getCartTotal, useCartStore } from "../features/cart/cartStore";
import { useAuthStore } from "../features/auth/authStore";
import { useShippingStore } from "../features/checkout/shippingStore";
import { useOrderStore } from "../features/orders/orderStore";

const TEST_CARDS = [
  { last4: "4242", label: "Approve", hint: "Successful authorization" },
  { last4: "0000", label: "Decline", hint: "Insufficient funds" },
  { last4: "9999", label: "Timeout", hint: "Provider timeout" },
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
    if (!shipping?.addressLine1 && items.length) navigate("/checkout/shipping", { replace: true });
  }, [shipping?.addressLine1, items.length, navigate]);

  if (!items.length) {
    return <main className="page-container polished-empty"><h1>No items to pay for</h1><p>Your cart is empty.</p><Link className="primary-link" to="/">Return to products</Link></main>;
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await synchronizeBackendCart(user.id, items);
      const result = await createCheckout({ userId: user.id, cardLast4: last4 });
      if (result.status !== "CONFIRMED") throw new Error(`Checkout status: ${result.status}`);
      const order = {
        ...result,
        userId: user.id,
        email: user.email,
        items,
        total,
        shipping,
        createdAt: new Date().toISOString(),
      };
      recordOrder(order);
      clearCart();
      toast.success(`Order confirmed. Notification queued for ${user.email}`);
      navigate(`/order/${result.orderId}`, { state: { justConfirmed: true }, replace: true });
    } catch (ex) {
      const message = ex?.data?.detail || ex?.data?.message || ex?.message || "Payment could not be completed";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page-container checkout-page">
      <CheckoutStepper active="Payment" />
      <div className="checkout-title"><p className="section-heading__eyebrow">Secure checkout</p><h1>Review and authorize payment</h1><p>Your backend Checkout Service orchestrates Cart, Inventory, Order and Payment services.</p></div>
      <div className="payment-grid">
        <form className="payment-card" onSubmit={submit}>
          <h2>Payment method</h2>
          <div className="payment-provider-row"><strong>Credit / debit card</strong><span>VISA • MC • AMEX</span></div>
          <label>Cardholder<input value={`${user.firstName} ${user.lastName}`} readOnly /></label>
          <label>Demo card<input value={`•••• •••• •••• ${last4}`} readOnly /></label>
          <div className="payment-row"><label>Expiry<input defaultValue="12/30" readOnly /></label><label>CVV<input defaultValue="123" type="password" readOnly /></label></div>
          <div className="test-cards">{TEST_CARDS.map((card) => <button type="button" className={last4 === card.last4 ? "active" : ""} onClick={() => setLast4(card.last4)} key={card.last4}><strong>{card.label}</strong><span>•••• {card.last4}</span><small>{card.hint}</small></button>)}</div>
          {error && <p className="payment-error">{error}</p>}
          <button className="payment-submit" disabled={busy}>{busy ? "Authorizing and confirming…" : `Pay ${new Intl.NumberFormat("en-US", { style: "currency", currency }).format(total)}`}</button>
          <p className="payment-note">DEV payment simulation only. Never enter a real card number.</p>
        </form>
        <aside className="payment-summary">
          <h2>Order summary</h2>
          {items.map((item) => <div key={item.productId}><span>{item.name} × {item.quantity}</span><strong>{new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(item.price) * item.quantity)}</strong></div>)}
          <hr/><div><span>Total</span><strong>{new Intl.NumberFormat("en-US", { style: "currency", currency }).format(total)}</strong></div>
          <div className="delivery-card"><strong>Deliver to</strong><span>{shipping.fullName}</span><span>{shipping.addressLine1}{shipping.addressLine2 ? `, ${shipping.addressLine2}` : ""}</span><span>{shipping.city}, {shipping.state} {shipping.postalCode}</span><span>{shipping.country}</span></div>
          <div className="delivery-card"><strong>Confirmation</strong><span>{user.email}</span><span>{user.phoneNumber}</span></div>
          <Link to="/checkout/shipping">← Edit shipping information</Link>
        </aside>
      </div>
    </main>
  );
}
