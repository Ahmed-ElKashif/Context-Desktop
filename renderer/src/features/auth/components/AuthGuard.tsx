import { Navigate, Outlet } from "react-router-dom";
//  Import our custom Redux hook
import { useAppSelector } from "../../../store/hooks";

export const AuthGuard = () => {
  //  Ask the Redux brain if the user is allowed in
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // If the Redux store says they aren't authenticated, kick them to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If the user is an admin, restrict them to /admin
  if (user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  // If authenticated, render the protected child routes
  return <Outlet />;
};
