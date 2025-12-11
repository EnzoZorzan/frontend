import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

export function PrivateRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem("token");

  return token ? children : <Navigate to="/login" />;
}
