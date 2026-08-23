import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    setForm((current) => ({
      ...current,
      fullName: current.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      email: current.email || user.email || "",
      phone: current.phone || user.phoneNumber || "",
      country: current.country || user.country || "India",
    }));
  }, [user]);

  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  function submit(event) {
    event.preventDefault();
    setAddress(form);
    navigate("/checkout/payment");
  }

  return (
    <main className="page-container checkout-page">
      <CheckoutStepper active="Shipping" />
      <div className="checkout-title"><p className="section-heading__eyebrow">Checkout</p><h1>Where should we deliver?</h1><p>Confirm the address before payment. Your signed-in profile is used to prefill contact details.</p></div>
      <div className="checkout-layout">
        <form className="checkout-form-card" onSubmit={submit}>
          <h2>Shipping information</h2>
          <div className="form-grid">
            <label className="field-span-2">Full name<input required value={form.fullName} onChange={update("fullName")} autoComplete="name" /></label>
            <label>Email<input required type="email" value={form.email} onChange={update("email")} autoComplete="email" /></label>
            <label>Phone<input required value={form.phone} onChange={update("phone")} autoComplete="tel" /></label>
            <label className="field-span-2">Address line 1<input required value={form.addressLine1} onChange={update("addressLine1")} autoComplete="address-line1" /></label>
            <label className="field-span-2">Address line 2 <small>optional</small><input value={form.addressLine2} onChange={update("addressLine2")} autoComplete="address-line2" /></label>
            <label>City<input required value={form.city} onChange={update("city")} autoComplete="address-level2" /></label>
            <label>State<input required value={form.state} onChange={update("state")} autoComplete="address-level1" /></label>
            <label>Postal code<input required value={form.postalCode} onChange={update("postalCode")} autoComplete="postal-code" /></label>
            <label>Country<input required value={form.country} onChange={update("country")} autoComplete="country-name" /></label>
          </div>
          <div className="checkout-form-actions"><Link to="/cart">← Back to cart</Link><button className="auth-submit">Continue to payment</button></div>
        </form>
        <aside className="checkout-side-card">
          <img src="/static/boutique-shipping.svg" alt="Boutique delivery" />
          <h3>What happens next?</h3>
          <ol><li>Payment is authorized.</li><li>Inventory is reserved and committed.</li><li>Order is confirmed.</li><li>Shipping and notification services consume the order event.</li><li>Cart is cleared only after confirmation.</li></ol>
        </aside>
      </div>
    </main>
  );
}
