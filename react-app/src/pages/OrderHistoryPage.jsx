import { Link } from "react-router-dom";
import { ArrowRight, PackageOpen } from "lucide-react";
import { useAuthStore } from "../features/auth/authStore";
import { useOrderStore } from "../features/orders/orderStore";
export default function OrderHistoryPage() {
  const user = useAuthStore((s) => s.currentUser);
  const orders = useOrderStore((s) => s.orders).filter(
    (o) => o.userId === user?.id,
  );
  return (
    <main className="page-container orders-page">
      <header className="page-header">
        <span className="eyebrow">MY ORDERS</span>
        <h1>Order history</h1>
        <p>Review purchases confirmed from this account on this device.</p>
      </header>
      {orders.length === 0 ? (
        <div className="empty-cart compact">
          <div className="empty-cart-icon">
            <PackageOpen size={34} />
          </div>
          <h2>No orders yet</h2>
          <p>
            When you complete checkout, your confirmed orders will appear here.
          </p>
          <Link className="primary-button" to="/">
            Start shopping <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <Link
              to={`/order/${order.orderId}`}
              className="order-row"
              key={order.orderId}
            >
              <div>
                <span>Order</span>
                <strong>#{String(order.orderId).slice(0, 8)}</strong>
                <small>{new Date(order.createdAt).toLocaleString()}</small>
              </div>
              <div>
                <span className="status-pill">{order.status}</span>
                <strong>
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: order.currency || "USD",
                  }).format(order.total || 0)}
                </strong>
                <ArrowRight size={18} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
