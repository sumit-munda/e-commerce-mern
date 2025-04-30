import { ReactElement } from "react";
import { Navigate, Outlet } from "react-router-dom";

interface Props {
  children?: ReactElement; // * optional JSX to render if access is allowed
  isAuthenticated: boolean; // * is the user logged in (required)
  adminOnly?: boolean; // * should this route be accessible to admins only
  admin?: boolean; // * is the user an admin
  redirect?: string; // * where to redirect if access is denied
}

const ProtectedRoute = ({
  isAuthenticated,
  children,
  adminOnly,
  admin,
  redirect = "/",
}: Props) => {
  if (!isAuthenticated) return <Navigate to={redirect} />;
  if (adminOnly && !admin) return <Navigate to={redirect} />;
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
