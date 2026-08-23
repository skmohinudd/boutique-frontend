import { Link } from "react-router-dom";
import { useAuthStore } from "../features/auth/authStore";
import { useOrderStore } from "../features/orders/orderStore";

export default function OrderHistoryPage(){const user=useAuthStore(s=>s.currentUser);const orders=useOrderStore(s=>s.orders).filter(o=>o.userId===user.id);return <main className="page-container account-page"><div className="account-heading"><div><span>ORDER HISTORY</span><h1>Your orders</h1><p>Confirmed orders created from this browser session.</p></div></div>{orders.length===0?<div className="polished-empty"><h2>No orders yet</h2><p>Complete checkout and your confirmed orders will appear here.</p><Link className="primary-link" to="/">Start shopping</Link></div>:<div className="orders-list">{orders.map(order=><Link to={`/order/${order.orderId}`} className="order-row" key={order.orderId}><div><strong>#{String(order.orderId).slice(0,8)}</strong><span>{new Date(order.createdAt).toLocaleString()}</span></div><div><span className="status-pill">{order.status}</span><strong>{new Intl.NumberFormat("en-US",{style:"currency",currency:order.currency||"USD"}).format(order.total||0)}</strong></div></Link>)}</div>}</main>}

