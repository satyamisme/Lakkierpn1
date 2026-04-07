import React from "react";
import { useAuth } from "../context/AuthContext";

interface GateProps {
  id: number;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const Gate: React.FC<GateProps> = ({ id, children, fallback = null }) => {
  const { hasPermission } = useAuth();

  if (hasPermission(id)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
