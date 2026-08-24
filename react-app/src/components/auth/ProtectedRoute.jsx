import { Navigate, useLocation } from "react-router-dom";
import { useBoutiqueAuth } from "../../auth/AuthProvider";
import { useAuthStore } from "../../features/auth/authStore";
export default function ProtectedRoute({ children }) {
  const auth = useBoutiqueAuth();
  const location = useLocation();
  const profileStatus = useAuthStore((s) => s.profileStatus);
  const profileError = useAuthStore((s) => s.profileError);
  if (auth.loading || (auth.isAuthenticated && profileStatus === "loading"))
    return (
      <main className="center-state">
        <div className="spinner" />
        <h1>Loading your account</h1>
        <p>Just a moment while we prepare your shopping profile.</p>
      </main>
    );
  if (!auth.isAuthenticated)
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  if (profileStatus === "error")
    return (
      <main className="center-state">
        <h1>Your sign-in succeeded</h1>
        <p>{profileError}</p>
        <button className="primary-button" onClick={auth.retry}>
          Try again
        </button>
      </main>
    );
  return children;
}
