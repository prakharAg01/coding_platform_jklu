import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { Context } from "../main";

/**
 * ProtectedRoute
 * Wraps a page component and enforces authentication + role requirements.
 *
 * Props:
 *   allowedRoles  – array of role strings that may access this route
 *                   e.g. ["Admin"] or ["Teacher", "Admin"]
 *                   If omitted, any authenticated user is allowed.
 *   children      – the page component to render when access is granted
 *
 * Behaviour:
 *   1. While the server auth check is still in-flight (authLoading), renders
 *      a full-screen spinner so no role check runs against stale localStorage.
 *   2. If unauthenticated → redirect to /auth
 *   3. If authenticated but wrong role → redirect to /
 *   4. Otherwise → renders children normally
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, user, authLoading } = useContext(Context);

  // ── 1. Wait for server-side auth verification ──────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm">Verifying access…</p>
        </div>
      </div>
    );
  }

  // ── 2. Must be authenticated ───────────────────────────────────────────────
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // ── 3. Must have an allowed role (if specified) ────────────────────────────
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user?.role)) {
      return <Navigate to="/" replace />;
    }
  }

  // ── 4. Access granted ──────────────────────────────────────────────────────
  return children;
}
