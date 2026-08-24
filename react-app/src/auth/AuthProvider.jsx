import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAccessToken, setAccessToken } from "./tokenStore";
import {
  ensureSession,
  getClaims,
  getTokens,
  handleAuthenticationCallback,
  logoutFromCognito,
  startAuthentication,
} from "./cognitoAuth";
import { useAuthStore } from "../features/auth/authStore";

const AuthContext = createContext(null);
export function useBoutiqueAuth() {
  const value = useContext(AuthContext);
  if (!value)
    throw new Error("useBoutiqueAuth must be used inside BoutiqueAuthProvider");
  return value;
}
export default function BoutiqueAuthProvider({ children }) {
  const navigate = useNavigate();
  const syncFromCognito = useAuthStore((s) => s.syncFromCognito);
  const setSignedOut = useAuthStore((s) => s.setSignedOut);
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState(null);
  const [error, setError] = useState("");

  async function hydrate() {
    setLoading(true);
    setError("");
    try {
      const returnTo = await handleAuthenticationCallback();
      const authenticated = await ensureSession();
      if (!authenticated) {
        clearAccessToken();
        setClaims(null);
        setSignedOut();
        return;
      }
      const tokens = getTokens();
      setAccessToken(tokens.accessToken);
      const nextClaims = getClaims();
      setClaims(nextClaims);
      await syncFromCognito(nextClaims);
      if (returnTo) navigate(returnTo, { replace: true });
    } catch (err) {
      clearAccessToken();
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    hydrate();
  }, []);
  const value = useMemo(
    () => ({
      loading,
      error,
      isAuthenticated: Boolean(claims && getTokens().accessToken),
      claims,
      signIn: (returnTo) => startAuthentication({ returnTo, signup: false }),
      signUp: (returnTo) => startAuthentication({ returnTo, signup: true }),
      logout: () => {
        setSignedOut();
        clearAccessToken();
        logoutFromCognito();
      },
      retry: hydrate,
    }),
    [claims, error, loading],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
