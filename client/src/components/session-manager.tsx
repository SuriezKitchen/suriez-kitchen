import { useState } from "react";
import { useLocation } from "wouter";
import { useInactivity } from "@/hooks/use-inactivity";
import SessionTimeoutDialog from "@/components/session-timeout-dialog";

interface SessionManagerProps {
  children: React.ReactNode;
}

export default function SessionManager({ children }: SessionManagerProps) {
  const [, setLocation] = useLocation();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const handleInactive = async () => {
    // Session has expired, redirect to login
    try {
      await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ operation: "logout" }),
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLocation("/admin/login");
    }
  };

  const handleWarning = (remainingTime: number) => {
    setTimeLeft(remainingTime);
    setShowWarning(true);
  };

  const handleExtendSession = () => {
    setShowWarning(false);
    setTimeLeft(0);
    // The useInactivity hook will automatically reset the timer
    // when any activity is detected
  };

  const { timeLeft: currentTimeLeft, isWarning } = useInactivity({
    timeout: 15 * 60 * 1000, // 15 minutes
    onInactive: handleInactive,
    onWarning: handleWarning,
    warningTime: 2 * 60 * 1000, // Show warning 2 minutes before timeout
  });

  return (
    <>
      {children}
      <SessionTimeoutDialog
        isOpen={showWarning && isWarning}
        timeLeft={timeLeft || currentTimeLeft || 0}
        onExtend={handleExtendSession}
        onLogout={handleInactive}
      />
    </>
  );
}
