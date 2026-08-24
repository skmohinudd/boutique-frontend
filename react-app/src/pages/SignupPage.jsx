import { Navigate } from "react-router-dom";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { useBoutiqueAuth } from "../auth/AuthProvider";
export default function SignupPage() {
  const auth = useBoutiqueAuth();
  if (auth.isAuthenticated) return <Navigate to="/account" replace />;
  return (
    <main className="auth-layout auth-layout--signup">
      <section className="auth-art signup-art">
        <div className="auth-art-content">
          <span className="eyebrow">JOIN BOUTIQUE</span>
          <h1>Create an account that keeps shopping simple.</h1>
          <div className="signup-points">
            <span>
              <Check /> Faster checkout
            </span>
            <span>
              <Check /> One place for your orders
            </span>
            <span>
              <Check /> Manage your contact details
            </span>
            <span>
              <Check /> Secure account recovery
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
          <h2>Create your account</h2>
          <p>
            Account creation and email verification are handled by our secure
            sign-in service.
          </p>
          <button
            className="auth-submit"
            onClick={() => auth.signUp("/account")}
          >
            <ShieldCheck size={19} />
            Continue to create account <ArrowRight size={18} />
          </button>
          <p className="auth-help">
            Already registered? <a href="/login">Sign in</a>
          </p>
          <small>
            After email verification, you’ll return to Boutique automatically.
          </small>
        </div>
      </section>
    </main>
  );
}
