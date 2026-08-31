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
  { last4: "4242", label: "Approve", description: "Demo success" },
  { last4: "0000", label: "Decline", description: "Demo decline" },
  { last4: "9999", label: "Timeout", description: "Demo timeout" },
];

function formatMoney(value, currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(value || 0));
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.currentUser);
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const shipping = useShippingStore((state) => state.address);
  const recordOrder = useOrderStore((state) => state.recordOrder);

  const [last4, setLast4] = useState("4242");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const total = useMemo(() => getCartTotal(items), [items]);
  const currency = items[0]?.currency || "USD";

  useEffect(() => {
    if (!shipping?.addressLine1 && items.length) {
      navigate("/checkout/shipping", { replace: true });
    }
  }, [shipping?.addressLine1, items.length, navigate]);

  if (!items.length) {
    return (
      <main className="center-state">
        <h1>Your cart is empty</h1>
        <p>Add a product before continuing to payment.</p>
        <Link className="primary-button" to="/">
          Shop products
        </Link>
      </main>
    );
  }

  async function submit(event) {
    event.preventDefault();

    if (busy) return;

    setError("");

    if (!user?.id) {
      const message = "Your account profile is not ready. Please sign in again.";
      setError(message);
      toast.error(message);
      return;
    }

    if (!shipping?.addressLine1 || !shipping?.city || !shipping?.postalCode) {
      const message = "Please complete your delivery address before payment.";
      setError(message);
      toast.error(message);
      return;
    }

    if (!Number.isFinite(Number(total)) || Number(total) <= 0) {
      const message = "Your order total is invalid. Please review your cart.";
      setError(message);
      toast.error(message);
      return;
    }

    setBusy(true);

    try {
      // The browser cart is synchronized to the backend first. The Bearer token
      // is relayed by CartService when it validates the active Boutique user.
      await synchronizeBackendCart(user.id, items);

      const result = await createCheckout({
        userId: user.id,
        cardLast4: last4,
      });

      if (result.status !== "CONFIRMED") {
        throw new Error(
          result.status === "PAYMENT_FAILED"
            ? "The demo payment was declined. Choose the Approve card to complete the order."
            : `Checkout status: ${result.status}`,
        );
      }

      recordOrder({
        ...result,
        userId: user.id,
        email: user.email,
        items: items.map((item) => ({ ...item })),
        total: Number(result.total ?? total),
        currency: result.currency || currency,
        shipping: { ...shipping },
        createdAt: new Date().toISOString(),
      });

      clearCart();
      toast.success("Demo payment approved. Your order is confirmed.");

      navigate(`/order/${result.orderId}`, {
        state: { justConfirmed: true },
        replace: true,
      });
    } catch (exception) {
      const message =
        exception?.data?.detail ||
        exception?.data?.message ||
        exception?.message ||
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
        <p>
          This is a demo checkout. No real card is charged; the selected demo
          outcome is validated by the Payment Service.
        </p>
      </header>

      <div className="payment-grid">
        <form className="checkout-card payment-card" onSubmit={submit}>
          <div className="checkout-card-title">
            <CreditCard />
            <div>
              <h2>Demo payment</h2>
              <p>Use Approve to complete the order successfully.</p>
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
            Demo card
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
            {TEST_CARDS.map((card) => (
              <button
                type="button"
                className={last4 === card.last4 ? "active" : ""}
                key={card.last4}
                onClick={() => {
                  setLast4(card.last4);
                  setError("");
                }}
                disabled={busy}
              >
                <strong>{card.label}</strong>
                <span>•••• {card.last4}</span>
                <small>{card.description}</small>
              </button>
            ))}
          </div>

          {error && <p className="payment-error">{error}</p>}

          <button className="checkout-button" disabled={busy}>
            <LockKeyhole size={18} />
            {busy
              ? "Processing demo payment…"
              : `Place order · ${formatMoney(total, currency)}`}
          </button>

          <p className="payment-safe">
            <ShieldCheck size={16} /> No real payment details are collected or
            charged in this environment.
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
                {formatMoney(Number(item.price) * item.quantity, currency)}
              </strong>
            </div>
          ))}
          <hr />
          <div className="summary-total">
            <span>Total</span>
            <strong>{formatMoney(total, currency)}</strong>
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
