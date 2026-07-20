import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLogin from '../../pages/AdminLogin';

// Luxury minimal loading screen for route transitions
const GuardLoading = () => (
  <div 
    className="flex flex-col items-center justify-center min-h-screen w-full"
    style={{ background: "linear-gradient(180deg, #FBE7C6 0%, #F6EFE3 40%, #E9DCC4 100%)" }}
  >
    <div className="relative w-16 h-16 flex items-center justify-center">
      <div className="absolute border border-t-[#B68D40] border-[#E6DCCF] rounded-full w-12 h-12 animate-spin duration-700" />
      <span className="font-serif text-[#181818] text-sm font-semibold tracking-widest uppercase">E</span>
    </div>
    <span className="mt-4 text-[9px] uppercase tracking-widest text-[#B68D40] font-bold animate-pulse">Syncing Credentials...</span>
  </div>
);

/**
   Restricts route to authenticated clients. Redirects guests to profile portal (containing login panel).
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <GuardLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/profile" state={{ from: location }} replace />;
  }

  return children;
};

/**
   Restricts route to store administrators. Redirects unprivileged clients to landing page.
 */
export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <GuardLoading />;
  }

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  if (!isAdmin) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
};

/**
   Restricts route to guests. Redirects authenticated clients to their profile portal.
 */
export const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <GuardLoading />;
  }

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

/**
   Generic role checker
 */
export const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <GuardLoading />;
  }

  if (!isAuthenticated || !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default {
  ProtectedRoute,
  AdminRoute,
  GuestRoute,
  RoleRoute,
};
