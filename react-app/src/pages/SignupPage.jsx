import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthStore } from "../features/auth/authStore";

const initial = { username:"", firstName:"", lastName:"", email:"", phoneNumber:"", country:"India", password:"", confirmPassword:"" };
export default function SignupPage() {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const [form,setForm] = useState(initial); const [busy,setBusy]=useState(false);
  const update=(key)=>(e)=>setForm({...form,[key]:e.target.value});
  async function submit(e){e.preventDefault(); if(form.password!==form.confirmPassword){toast.error("Passwords do not match");return;} setBusy(true);try{await register(form);toast.success("Account created successfully");navigate("/");}catch(error){toast.error(error?.data?.detail||error.message);}finally{setBusy(false);}}
  return <main className="auth-page auth-page--signup"><section className="auth-visual"><img src="/static/boutique-auth.svg" alt="Boutique registration"/><div><span>JOIN BOUTIQUE</span><h1>Create your shopping profile.</h1><p>Your backend User Service stores your identity profile while this DEV frontend handles local sign-in until Cognito is enabled.</p></div></section><section className="auth-panel"><form className="auth-card auth-card--wide" onSubmit={submit}><h2>Create account</h2><div className="form-grid">
    <label>Username<input required value={form.username} onChange={update("username")}/></label>
    <label>Country<input required value={form.country} onChange={update("country")}/></label>
    <label>First name<input required value={form.firstName} onChange={update("firstName")}/></label>
    <label>Last name<input required value={form.lastName} onChange={update("lastName")}/></label>
    <label>Email<input type="email" required value={form.email} onChange={update("email")}/></label>
    <label>Phone number<input required value={form.phoneNumber} onChange={update("phoneNumber")}/></label>
    <label>Password<input type="password" required minLength="8" value={form.password} onChange={update("password")}/></label>
    <label>Confirm password<input type="password" required minLength="8" value={form.confirmPassword} onChange={update("confirmPassword")}/></label>
  </div><button className="auth-submit" disabled={busy}>{busy?"Creating account…":"Register"}</button><p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p></form></section></main>;
}

