import { ReactNode } from "react";

interface SimpleSessionManagerProps {
  children: ReactNode;
}

export default function SimpleSessionManager({
  children,
}: SimpleSessionManagerProps) {
  // For now, just return children without session management
  // This will be replaced with proper session management later
  return <>{children}</>;
}
