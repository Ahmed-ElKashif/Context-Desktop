import { Navigate, Outlet } from "react-router-dom";
//  Import our custom Redux hook
import { useAppSelector } from "../../../store/hooks";
import { useLocation } from "react-router-dom";

export const AuthGuard = () => {
  //  Ask the Redux brain if the user is allowed in
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // If the Redux store says they aren't authenticated, kick them to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const location = useLocation();

  // If the user is an admin, restrict them to /admin or /profile
  if (user?.role === "admin" && location.pathname !== "/profile") {
    return <Navigate to="/admin" replace />;
  }

  // If authenticated, render the protected child routes
  return <Outlet />;
};
