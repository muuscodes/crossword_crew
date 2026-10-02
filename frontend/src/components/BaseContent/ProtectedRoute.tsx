import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../context/auth";
import PageMessage from "../Common/PageMessage";

// Pages behind this route need a login. Logged-out visitors go to the landing page, which
// sends them back here after they log in.
export default function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <PageMessage>Loading…</PageMessage>;
  if (status === "unauthenticated") {
    return <Navigate to="/" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }
  return <Outlet />;
}
