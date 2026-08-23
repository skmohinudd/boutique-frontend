import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import CheckoutStepper from "../components/checkout/CheckoutStepper";
import { getOrder } from "../api/orderApi";
import { useOrderStore } from "../features/orders/orderStore";
import { useAuthStore } from "../features/auth/authStore";

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const local = useOrderStore((s) => s.orders.find((o) => o.orderId === orderId));
  const user = useAuthStore((s) => s.currentUser);
  const [order, setOrder] = useState(local || null);
  const [loading, setLoading] = useState(!local);

  useEffect(() => {
    let active = true;
    getOrder(orderId)
      .then((data) => active && setOrder((previous) => ({ ...previous, ...data, orderId: data.id || orderId })))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [orderId]);

  if (loading) return <main className="page-container order-confirmation"><p>Loading order…</p></main>;

  return (
    <main className="page-container order-confirmation">
      {location.state?.justConfirmed && <CheckoutStepper active="Confirmation" />}
      <img src="/static/order-confirmed.svg" alt="Order confirmed" />
      <span className="success-chip">ORDER CONFIRMED</span>
      <h1>Thank you, {user.firstName}!</h1>
      <p>Your order has been confirmed. The checkout orchestrator clears the backend cart after confirmation and the browser cart is now empty.</p>
      <div className="confirmation-card">
        <div><span>Order ID</span><strong>{orderId}</strong></div>
        <div><span>Payment</span><strong>{order?.paymentId || "Authorized"}</strong></div>
        <div><span>Status</span><strong>{order?.status || "CONFIRMED"}</strong></div>
        <div><span>Confirmation email</span><strong>{user.email}</strong></div>
      </div>
      {order?.shipping?.addressLine1 && <div className="confirmation-shipping"><strong>Shipping to</strong><p>{order.shipping.fullName}</p><p>{order.shipping.addressLine1}{order.shipping.addressLine2 ? `, ${order.shipping.addressLine2}` : ""}</p><p>{order.shipping.city}, {order.shipping.state} {order.shipping.postalCode}, {order.shipping.country}</p></div>}
      <p className="notification-note">Order Service publishes the confirmed-order event. Shipping and Notification services consume asynchronously. Notification Service resolves your email through User Service and Mailpit captures the DEV email.</p>
      <div className="confirmation-actions"><Link className="primary-link" to="/">Continue shopping</Link><Link className="secondary-link" to="/orders">View my orders</Link></div>
    </main>
  );
}
