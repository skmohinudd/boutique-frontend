import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { CheckCircle2, PackageCheck } from "lucide-react";
import CheckoutStepper from "../components/checkout/CheckoutStepper";
import { getOrder } from "../api/orderApi";
import { useOrderStore } from "../features/orders/orderStore";
import { useAuthStore } from "../features/auth/authStore";
export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const local = useOrderStore((s) =>
    s.orders.find((o) => o.orderId === orderId),
  );
  const user = useAuthStore((s) => s.currentUser);
  const [order, setOrder] = useState(local || null);
  const [loading, setLoading] = useState(!local);
  useEffect(() => {
    let active = true;
    getOrder(orderId)
      .then(
        (data) =>
          active &&
          setOrder((prev) => ({
            ...prev,
            ...data,
            orderId: data.id || orderId,
          })),
      )
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [orderId]);
  if (loading)
    return (
      <main className="center-state">
        <div className="spinner" />
        <h1>Loading your order</h1>
      </main>
    );
  return (
    <main className="page-container order-confirmation">
      {location.state?.justConfirmed && (
        <CheckoutStepper active="Confirmation" />
      )}
      <CheckCircle2 className="confirmation-icon" />
      <span className="success-chip">ORDER CONFIRMED</span>
      <h1>Thank you, {user?.firstName || "Shopper"}.</h1>
      <p>
        Your order is confirmed. We’ll keep the details here so you can return
        to them anytime.
      </p>
      <div className="confirmation-card">
        <div>
          <span>Order ID</span>
          <strong>{orderId}</strong>
        </div>
        <div>
          <span>Status</span>
          <strong>{order?.status || "CONFIRMED"}</strong>
        </div>
        <div>
          <span>Payment</span>
          <strong>{order?.paymentId || "Authorized"}</strong>
        </div>
        <div>
          <span>Confirmation</span>
          <strong>{user?.email}</strong>
        </div>
      </div>
      {order?.shipping?.addressLine1 && (
        <div className="shipping-confirm">
          <PackageCheck />
          <div>
            <strong>Delivery address</strong>
            <p>{order.shipping.fullName}</p>
            <p>
              {order.shipping.addressLine1}
              {order.shipping.addressLine2
                ? `, ${order.shipping.addressLine2}`
                : ""}
            </p>
            <p>
              {order.shipping.city}, {order.shipping.state}{" "}
              {order.shipping.postalCode}
            </p>
          </div>
        </div>
      )}
      <div className="confirmation-actions">
        <Link className="primary-button" to="/">
          Continue shopping
        </Link>
        <Link className="secondary-button" to="/orders">
          View all orders
        </Link>
      </div>
    </main>
  );
}
