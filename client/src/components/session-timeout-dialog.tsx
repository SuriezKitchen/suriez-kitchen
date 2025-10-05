import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface SessionTimeoutDialogProps {
  isOpen: boolean;
  timeLeft: number;
  onExtend: () => void;
  onLogout: () => void;
}

export default function SessionTimeoutDialog({
  isOpen,
  timeLeft,
  onExtend,
  onLogout,
}: SessionTimeoutDialogProps) {
  const [, setLocation] = useLocation();
  const [displayTime, setDisplayTime] = useState("");

  useEffect(() => {
    if (timeLeft > 0) {
      const minutes = Math.floor(timeLeft / 60000);
      const seconds = Math.floor((timeLeft % 60000) / 1000);
      setDisplayTime(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    } else {
      setDisplayTime("0:00");
    }
  }, [timeLeft]);

  const handleLogout = async () => {
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

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <i className="fas fa-clock text-orange-500"></i>
            Session Timeout Warning
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-500 mb-2">
              {displayTime}
            </div>
            <p className="text-muted-foreground">
              Your session will expire due to inactivity. Click "Stay Logged In"
              to continue your session.
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <i className="fas fa-exclamation-triangle text-orange-500 mt-1"></i>
              <div className="text-sm">
                <p className="font-medium text-orange-800 mb-1">
                  Security Notice
                </p>
                <p className="text-orange-700">
                  For security reasons, admin sessions automatically expire
                  after 15 minutes of inactivity.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Logout Now
            </Button>
            <Button
              onClick={onExtend}
              className="bg-primary hover:bg-primary/90"
            >
              <i className="fas fa-clock mr-2"></i>
              Stay Logged In
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
