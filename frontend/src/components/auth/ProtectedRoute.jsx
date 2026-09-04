import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");

  // Safely parse user — guard against invalid JSON or missing key
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    // Invalid JSON in localStorage — treat as unauthenticated
  }

  // If not logged in → redirect to signin
  if (!token) return <Navigate to="/signin" replace />;

  // If trying to access admin area without admin role → go to homepage
  if (requiredRole && user?.User_Type_ID !== requiredRole) {
    return <Navigate to="/homepage" replace />;
  }

  return children;
}
