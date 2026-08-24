import { useEffect } from "react";
import { useBoutiqueAuth } from "../auth/AuthProvider";
export default function LogoutPage() {
  const auth = useBoutiqueAuth();
  useEffect(() => {
    auth.logout();
  }, []);
  return (
    <main className="center-state">
      <div className="spinner" />
      <h1>Signing you out</h1>
      <p>You’ll return to Boutique in a moment.</p>
    </main>
  );
}
