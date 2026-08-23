import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../features/auth/authStore";

export default function ProtectedRoute({ children }) {
  const user = useAuthStore((state) => state.currentUser);
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

