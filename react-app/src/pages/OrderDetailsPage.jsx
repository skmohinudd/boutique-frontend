import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { CheckCircle2, Home, PackageCheck, ShoppingBag } from "lucide-react";
import CheckoutStepper from "../components/checkout/CheckoutStepper";
import { getOrder } from "../api/orderApi";
import { useOrderStore } from "../features/orders/orderStore";
import { useAuthStore } from "../features/auth/authStore";

function formatMoney(value, currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(Number(value || 0));
}

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const local = useOrderStore((state) =>
    state.orders.find((order) => order.orderId === orderId),
  );
  const user = useAuthStore((state) => state.currentUser);

  const [order, setOrder] = useState(local || null);
  const [loading, setLoading] = useState(!local);

  useEffect(() => {
    let active = true;

    getOrder(orderId)
      .then((data) => {
        if (!active) return;
        setOrder((previous) => ({
          ...previous,
          ...data,
          orderId: data.id || orderId,
          shipping: previous?.shipping,
          email: previous?.email,
        }));
      })
      .catch(() => {
        // The locally persisted confirmed order is still enough to render a
        // useful success page if the follow-up read is temporarily unavailable.
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [orderId]);

  const items = Array.isArray(order?.items) ? order.items : [];
  const currency = order?.currency || local?.currency || "USD";

  const calculatedTotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const lineTotal =
          item.lineTotal ??
          Number(item.unitPrice ?? item.price ?? 0) * Number(item.quantity || 0);
        return sum + Number(lineTotal || 0);
      }, 0),
    [items],
  );

  const total = Number(order?.total ?? local?.total ?? calculatedTotal);

  if (loading) {
    return (
      <main className="center-state">
        <div className="spinner" />
        <h1>Loading your order</h1>
      </main>
    );
  }

  return (
    <main className="page-container order-confirmation">
      {location.state?.justConfirmed && (
        <CheckoutStepper active="Confirmation" />
      )}

      <section className="confirmation-hero">
        <CheckCircle2 className="confirmation-icon" />
        <span className="success-chip">PAYMENT APPROVED · ORDER CONFIRMED</span>
        <h1>Thank you, {user?.firstName || "Shopper"}.</h1>
        <p>
          Your demo payment was approved successfully and your order has been
          confirmed. No real card was charged.
        </p>
      </section>

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
          <strong>{order?.paymentId || "Demo authorized"}</strong>
        </div>
        <div>
          <span>Order total</span>
          <strong>{formatMoney(total, currency)}</strong>
        </div>
      </div>

      <section className="confirmation-products">
        <div className="confirmation-section-title">
          <ShoppingBag />
          <div>
            <span>YOUR ORDER</span>
            <h2>Products confirmed</h2>
          </div>
        </div>

        <div className="confirmation-product-list">
          {items.length ? (
            items.map((item) => {
              const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
              const quantity = Number(item.quantity || 0);
              const lineTotal = Number(
                item.lineTotal ?? unitPrice * quantity,
              );

              return (
                <div
                  className="confirmation-product-row"
                  key={`${item.productId || item.sku}-${item.name}`}
                >
                  <div>
                    <strong>{item.name || "Boutique product"}</strong>
                    <span>
                      Qty {quantity}
                      {item.sku ? ` · ${item.sku}` : ""}
                    </span>
                  </div>
                  <strong>{formatMoney(lineTotal, currency)}</strong>
                </div>
              );
            })
          ) : (
            <p className="confirmation-products-empty">
              Your order items are confirmed and can be viewed in order history.
            </p>
          )}
        </div>

        <div className="confirmation-grand-total">
          <span>Total paid (demo)</span>
          <strong>{formatMoney(total, currency)}</strong>
        </div>
      </section>

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
          <Home size={18} /> Back to home
        </Link>
        <Link className="secondary-button" to="/orders">
          View all orders
        </Link>
      </div>
    </main>
  );
}
