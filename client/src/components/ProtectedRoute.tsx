import type { ReactElement } from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { RootState } from "../redux/store";

interface Props {
  children?: ReactElement;
  adminOnly?: boolean;
  guestOnly?: boolean;
  redirect?: string;
}

const ProtectedRoute = ({
  children,
  adminOnly,
  guestOnly,
  redirect,
}: Props) => {
  const user = useSelector((state: RootState) => state.userReducer.user);
  const location = useLocation();

  // Not signed in
  if (guestOnly) {
    return user ? <Navigate to="/" replace /> : (children ?? <Outlet />);
  }

  // Require authentication
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Require admin access
  if (adminOnly && user.role !== "admin") {
    return <Navigate to={redirect ?? "/"} replace />;
  }

  return children ?? <Outlet />;
};

export default ProtectedRoute;
