import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthStore } from "../features/auth/authStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault(); setBusy(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.firstName}`);
      navigate(location.state?.from || "/", { replace: true });
    } catch (error) { toast.error(error.message); }
    finally { setBusy(false); }
  }

  return <main className="auth-page">
    <section className="auth-visual"><img src="/static/boutique-auth.svg" alt="Boutique shopping"/><div><span>WELCOME BACK</span><h1>Your Boutique account, all in one place.</h1><p>Sign in to checkout, track orders, and receive order confirmation notifications.</p></div></section>
    <section className="auth-panel"><form className="auth-card" onSubmit={submit}><div className="auth-mark">B</div><h2>Sign in</h2><p>Use the account you registered on this browser.</p>
      <label>Email<input type="email" required autoComplete="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
      <label>Password<input type="password" required minLength="8" autoComplete="current-password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label>
      <button className="auth-submit" disabled={busy}>{busy?"Signing in…":"Sign in"}</button>
      <p className="auth-switch">New to Boutique? <Link to="/signup">Create an account</Link></p>
      <small className="security-note">DEV auth stores only a password hash in your browser. Production identity will use Cognito.</small>
    </form></section>
  </main>;
}

