import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useBoutiqueAuth } from "../auth/AuthProvider";
import {
  Bell,
  ChevronRight,
  CircleUserRound,
  Heart,
  LockKeyhole,
  LogOut,
  MapPin,
  Package,
  Settings2,
  UserRound,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuthStore } from "../features/auth/authStore";

const tabs = [
  { id: "overview", label: "Overview", icon: CircleUserRound },
  { id: "personal", label: "Personal information", icon: UserRound },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "orders", label: "Orders", icon: Package },
  { id: "security", label: "Sign-in & security", icon: LockKeyhole },
  { id: "preferences", label: "Preferences", icon: Settings2 },
];
export default function ProfilePage() {
  const auth = useBoutiqueAuth();
  const user = useAuthStore((s) => s.currentUser);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const [active, setActive] = useState("overview");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phoneNumber: user?.phoneNumber || "",
    country: user?.country || "India",
  });
  const initials = useMemo(
    () =>
      `${user?.firstName?.[0] || "B"}${user?.lastName?.[0] || ""}`.toUpperCase(),
    [user],
  );
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await updateProfile(form);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }
  const change = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <main className="page-container account-shell">
      <header className="account-hero">
        <div className="avatar">{initials}</div>
        <div>
          <span>MY ACCOUNT</span>
          <h1>Hi, {user?.firstName || "Shopper"}</h1>
          <p>{user?.email || auth.claims?.email}</p>
        </div>
      </header>
      <div className="account-grid">
        <aside className="account-menu">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={active === id ? "active" : ""}
              onClick={() => setActive(id)}
            >
              <Icon size={19} />
              <span>{label}</span>
              <ChevronRight size={16} />
            </button>
          ))}
          <Link to="/logout" className="account-logout">
            <LogOut size={19} />
            Sign out
          </Link>
        </aside>
        <section className="account-content">
          {active === "overview" && (
            <div>
              <div className="account-title">
                <h2>Account overview</h2>
                <p>Everything important in one place.</p>
              </div>
              <div className="account-cards">
                <button onClick={() => setActive("personal")}>
                  <UserRound />
                  <div>
                    <strong>Personal information</strong>
                    <span>Review your name and contact details</span>
                  </div>
                  <ChevronRight />
                </button>
                <button onClick={() => setActive("addresses")}>
                  <MapPin />
                  <div>
                    <strong>Delivery addresses</strong>
                    <span>Manage where your orders are sent</span>
                  </div>
                  <ChevronRight />
                </button>
                <Link to="/orders">
                  <Package />
                  <div>
                    <strong>Your orders</strong>
                    <span>View confirmed purchases</span>
                  </div>
                  <ChevronRight />
                </Link>
                <button onClick={() => setActive("security")}>
                  <LockKeyhole />
                  <div>
                    <strong>Sign-in & security</strong>
                    <span>Password, verification and sessions</span>
                  </div>
                  <ChevronRight />
                </button>
              </div>
              <div className="account-note">
                <Heart size={20} />
                <div>
                  <strong>Make your next checkout faster</strong>
                  <p>
                    Keep your contact details current so checkout can prefill
                    them for you.
                  </p>
                </div>
              </div>
            </div>
          )}
          {active === "personal" && (
            <div>
              <div className="account-title">
                <h2>Personal information</h2>
                <p>These details are used for your account and checkout.</p>
              </div>
              <form className="profile-form" onSubmit={save}>
                <div className="form-grid">
                  <label>
                    First name
                    <input
                      required
                      value={form.firstName}
                      onChange={change("firstName")}
                    />
                  </label>
                  <label>
                    Last name
                    <input
                      required
                      value={form.lastName}
                      onChange={change("lastName")}
                    />
                  </label>
                  <label>
                    Email
                    <input disabled value={user?.email || ""} />
                  </label>
                  <label>
                    Phone number
                    <input
                      value={form.phoneNumber}
                      onChange={change("phoneNumber")}
                    />
                  </label>
                  <label>
                    Country
                    <input value={form.country} onChange={change("country")} />
                  </label>
                </div>
                <button className="primary-button" disabled={busy}>
                  {busy ? "Saving…" : "Save changes"}
                </button>
              </form>
            </div>
          )}
          {active === "addresses" && (
            <div>
              <div className="account-title">
                <h2>Delivery addresses</h2>
                <p>
                  Your most recent checkout address is saved on this device for
                  convenience.
                </p>
              </div>
              <div className="placeholder-card">
                <MapPin size={32} />
                <h3>Add your preferred delivery address during checkout</h3>
                <p>We’ll use it to prefill future shipping details.</p>
                <Link className="secondary-button" to="/cart">
                  Go to cart
                </Link>
              </div>
            </div>
          )}
          {active === "orders" && (
            <div>
              <div className="account-title">
                <h2>Your orders</h2>
                <p>Review confirmed purchases and order details.</p>
              </div>
              <Link className="account-forward" to="/orders">
                <Package />
                <div>
                  <strong>Open order history</strong>
                  <span>View all confirmed orders</span>
                </div>
                <ChevronRight />
              </Link>
            </div>
          )}
          {active === "security" && (
            <div>
              <div className="account-title">
                <h2>Sign-in & security</h2>
                <p>
                  Manage your password, verification and active sign-in session.
                </p>
              </div>
              <div className="security-list">
                <div>
                  <LockKeyhole />
                  <span>
                    <strong>Password</strong>
                    <small>Managed on the secure sign-in service</small>
                  </span>
                </div>
                <div>
                  <ShieldCheckIcon />
                  <span>
                    <strong>Email verification</strong>
                    <small>
                      {auth.claims?.email_verified
                        ? "Verified"
                        : "Verification status unavailable"}
                    </small>
                  </span>
                </div>
                <Link to="/logout">
                  <LogOut />
                  <span>
                    <strong>Sign out</strong>
                    <small>End this browser session</small>
                  </span>
                </Link>
              </div>
            </div>
          )}
          {active === "preferences" && (
            <div>
              <div className="account-title">
                <h2>Preferences</h2>
                <p>Choose how you want Boutique to feel.</p>
              </div>
              <div className="preference-list">
                <label>
                  <span>
                    <Bell />
                    <b>Order updates</b>
                  </span>
                  <input type="checkbox" defaultChecked />
                </label>
                <label>
                  <span>
                    <Heart />
                    <b>Recommendations</b>
                  </span>
                  <input type="checkbox" defaultChecked />
                </label>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
function ShieldCheckIcon() {
  return <LockKeyhole />;
}
