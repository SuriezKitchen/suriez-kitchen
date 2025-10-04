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

  // Use external URL with referrer policy to avoid CORS issues
  const logoUrl =
    "https://pub-51f3a9919deb45cfbc4c98a1b2aec929.r2.dev/sureiz-kitchen-assets/suriez-logo.png";

  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={logoUrl}
        alt="Suriez - Taste Flavors"
        className={`${sizeClasses[size]} object-contain rounded-lg`}
        referrerPolicy="no-referrer"
        loading="lazy"
      />
    </div>
  );
}
