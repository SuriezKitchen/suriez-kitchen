import React from "react";
import { cn } from "@/lib/utils";

interface SuriezLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function SuriezLogo({
  className = "",
  size = "md",
}: SuriezLogoProps) {
  const sizeClasses = {
    sm: "h-8",
    md: "h-12",
    lg: "h-16",
  };

  return (
    <div className={`flex items-center ${className}`}>
      <img
        src="/src/assets/suriez-logo.png"
        alt="Suriez - Taste Flavors"
        className={`${sizeClasses[size]} object-contain rounded-lg`}
      />
    </div>
  );
}
