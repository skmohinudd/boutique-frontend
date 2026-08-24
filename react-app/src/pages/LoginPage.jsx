import { Navigate, useLocation } from "react-router-dom";
import {
  LockKeyhole,
  PackageCheck,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useBoutiqueAuth } from "../auth/AuthProvider";
export default function LoginPage() {
  const auth = useBoutiqueAuth();
  const location = useLocation();
  if (auth.isAuthenticated) return <Navigate to="/account" replace />;
  const signIn = () => auth.signIn(location.state?.from || "/account");
  return (
    <main className="auth-layout">
      <section className="auth-art">
        <div className="auth-art-content">
          <span className="eyebrow">WELCOME BACK</span>
          <h1>Your shopping, your orders, one secure account.</h1>
          <p>
            Sign in to continue checkout, view orders and manage your details.
          </p>
          <div className="auth-benefits">
            <span>
              <ShieldCheck /> Secure sign-in
            </span>
            <span>
              <PackageCheck /> Order history
            </span>
            <span>
              <UserRound /> Profile management
            </span>
          </div>
        </div>
      </section>
      <section className="auth-box-wrap">
        <div className="auth-box">
          <div className="auth-logo">
            <img src="/static/icons/Hipster_NavLogo.svg" alt="" />
            <span>Boutique</span>
          </div>
          <h2>Sign in to Boutique</h2>
          <p>You’ll continue on our secure sign-in page.</p>
          {auth.error && <p className="payment-error">{auth.error}</p>}
          <button
            className="auth-submit"
            onClick={signIn}
            disabled={auth.loading}
          >
            <LockKeyhole size={19} />
            {auth.loading ? "Preparing sign-in…" : "Continue to secure sign in"}
          </button>
          <div className="auth-divider">
            <span>New here?</span>
          </div>
          <a className="secondary-button full" href="/signup">
            Create an account
          </a>
          <small>
            After signing in, you’ll return to the page you were trying to open.
          </small>
        </div>
      </section>
    </main>
  );
}
