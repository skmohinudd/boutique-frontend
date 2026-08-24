import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";
import CheckoutStepper from "../components/checkout/CheckoutStepper";
import { useAuthStore } from "../features/auth/authStore";
import { useCartStore } from "../features/cart/cartStore";
import { useShippingStore } from "../features/checkout/shippingStore";
export default function ShippingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.currentUser);
  const items = useCartStore((s) => s.items);
  const saved = useShippingStore((s) => s.address);
  const setAddress = useShippingStore((s) => s.setAddress);
  const [form, setForm] = useState(saved);
  useEffect(() => {
    if (!items.length) navigate("/cart", { replace: true });
  }, [items.length, navigate]);
  useEffect(() => {
    setForm((c) => ({
      ...c,
      fullName:
        c.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
      email: c.email || user?.email || "",
      phone: c.phone || user?.phoneNumber || "",
      country: c.country || user?.country || "India",
    }));
  }, [user]);
  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  function submit(e) {
    e.preventDefault();
    setAddress(form);
    navigate("/checkout/payment");
  }
  return (
    <main className="page-container checkout-page">
      <CheckoutStepper active="Shipping" />
      <header className="checkout-heading">
        <span className="eyebrow">DELIVERY</span>
        <h1>Where should we send your order?</h1>
        <p>Confirm your contact and delivery details.</p>
      </header>
      <div className="checkout-grid">
        <form className="checkout-card" onSubmit={submit}>
          <div className="checkout-card-title">
            <MapPin />
            <div>
              <h2>Delivery address</h2>
              <p>Fields marked required are needed to continue.</p>
            </div>
          </div>
          <div className="form-grid">
            <label className="span-2">
              Full name
              <input
                required
                value={form.fullName}
                onChange={update("fullName")}
                autoComplete="name"
              />
            </label>
            <label>
              Email
              <input
                required
                type="email"
                value={form.email}
                onChange={update("email")}
              />
            </label>
            <label>
              Phone
              <input required value={form.phone} onChange={update("phone")} />
            </label>
            <label className="span-2">
              Address line 1
              <input
                required
                value={form.addressLine1}
                onChange={update("addressLine1")}
              />
            </label>
            <label className="span-2">
              Address line 2 <small>Optional</small>
              <input
                value={form.addressLine2}
                onChange={update("addressLine2")}
              />
            </label>
            <label>
              City
              <input required value={form.city} onChange={update("city")} />
            </label>
            <label>
              State
              <input required value={form.state} onChange={update("state")} />
            </label>
            <label>
              Postal code
              <input
                required
                value={form.postalCode}
                onChange={update("postalCode")}
              />
            </label>
            <label>
              Country
              <input
                required
                value={form.country}
                onChange={update("country")}
              />
            </label>
          </div>
          <div className="checkout-actions">
            <Link to="/cart">
              <ArrowLeft size={17} />
              Back to cart
            </Link>
            <button className="primary-button">
              Continue to payment <ArrowRight size={17} />
            </button>
          </div>
        </form>
        <aside className="checkout-aside">
          <img
            src="/static/boutique-shipping.svg"
            alt="Delivery illustration"
          />
          <h3>Your checkout is protected</h3>
          <span>
            <ShieldCheck /> Your signed-in account is used for this order.
          </span>
          <span>
            <PackageCheck /> Availability is checked before confirmation.
          </span>
          <p>You can review all details before placing the order.</p>
        </aside>
      </div>
    </main>
  );
}
