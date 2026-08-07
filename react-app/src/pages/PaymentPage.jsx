import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createCheckout } from "../api/checkoutApi";
import { synchronizeBackendCart } from "../api/cartApi";
import { environment } from "../config/environment";
import { getOrCreateLocalUserId } from "../features/session/localSession";
import { getCartTotal, useCartStore } from "../features/cart/cartStore";

const TEST_CARDS=[
 {last4:"4242",label:"Approve",hint:"Successful authorization"},
 {last4:"0000",label:"Decline",hint:"Insufficient funds"},
 {last4:"9999",label:"Timeout",hint:"Provider timeout"},
];
export default function PaymentPage(){
 const navigate=useNavigate();
 const items=useCartStore(s=>s.items); const clearCart=useCartStore(s=>s.clearCart);
 const [last4,setLast4]=useState("4242"); const [busy,setBusy]=useState(false); const [error,setError]=useState("");
 const total=useMemo(()=>getCartTotal(items),[items]); const currency=items[0]?.currency||"INR";
 async function submit(e){e.preventDefault(); if(!items.length)return; setBusy(true);setError("");
  try{const userId=await getOrCreateLocalUserId();await synchronizeBackendCart(userId,items); const result=await createCheckout({userId,cardLast4:last4});
   if(result.status!=="CONFIRMED")throw new Error(`Checkout status: ${result.status}`); clearCart(); toast.success(`Order ${result.orderId} confirmed`); navigate(`/order/${result.orderId}`);}
  catch(ex){const message=ex?.data?.detail||ex?.data?.message||ex?.message||"Payment could not be completed";setError(message);toast.error(message);} finally{setBusy(false);}}
 return <main className="payment-page">
  <section className="payment-hero"><div><span>SAFE DEMO CHECKOUT</span><h1>Secure payment simulation</h1><p>Production-style authorization without transmitting real card data or moving money.</p></div><div className="payment-shield">Protected flow<br/><strong>Demo only</strong></div></section>
  <div className="payment-grid"><form className="payment-card" onSubmit={submit}>
   <h2>Payment details</h2><label>Cardholder<input defaultValue="Khaja Mohinuddin" autoComplete="off"/></label>
   <label>Demo card<input value={`•••• •••• •••• ${last4}`} readOnly/></label>
   <div className="payment-row"><label>Expiry<input defaultValue="12/30" readOnly/></label><label>CVV<input defaultValue="123" type="password" readOnly/></label></div>
   <div className="test-cards">{TEST_CARDS.map(c=><button type="button" className={last4===c.last4?"active":""} onClick={()=>setLast4(c.last4)} key={c.last4}><strong>{c.label}</strong><span>•••• {c.last4}</span><small>{c.hint}</small></button>)}</div>
   {error&&<p className="payment-error">{error}</p>}<button className="payment-submit" disabled={busy||!items.length}>{busy?"Authorizing…":`Pay ${new Intl.NumberFormat("en-IN",{style:"currency",currency}).format(total)}`}</button>
   <p className="payment-note">Only the selected test-card ending is sent. Never enter a real card.</p>
  </form><aside className="payment-summary"><h2>Order summary</h2>{items.map(i=><div key={i.productId}><span>{i.name} × {i.quantity}</span><strong>{new Intl.NumberFormat("en-IN",{style:"currency",currency}).format(Number(i.price)*i.quantity)}</strong></div>)}<hr/><div><span>Total</span><strong>{new Intl.NumberFormat("en-IN",{style:"currency",currency}).format(total)}</strong></div><ol><li>Inventory reserved</li><li>Payment authorized</li><li>Order confirmed</li><li>Events delivered</li></ol><Link to="/cart">Return to cart</Link></aside></div>
 </main>;
}
