import React from "react";
import { cn } from "@/lib/utils";
import ResponsiveImage from "./responsive-image";

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

  // Use WebP version for better performance, with PNG fallback
  const logoUrlWebP =
    "https://v5igaday0pxfwtzb.public.blob.vercel-storage.com/logos/sureiz-kitchen-assets_suriez-logo.webp";
  const logoUrlPNG =
    "https://pub-51f3a9919deb45cfbc4c98a1b2aec929.r2.dev/sureiz-kitchen-assets/suriez-logo.png";

  return (
    <div className={`flex items-center ${className}`}>
      <ResponsiveImage
        src={logoUrlWebP}
        alt="Suriez - Taste Flavors"
        className={`${sizeClasses[size]} object-contain rounded-lg`}
        referrerPolicy="no-referrer"
        loading="lazy"
        width={size === "sm" ? 32 : size === "md" ? 48 : 64}
        height={size === "sm" ? 32 : size === "md" ? 48 : 64}
        fallbackSrc={logoUrlPNG}
        quality={90}
      />
    </div>
  );
}
