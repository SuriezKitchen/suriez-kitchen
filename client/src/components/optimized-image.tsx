import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  // Hint browser to prioritize critical images
  fetchPriority?: "high" | "low" | "auto";
  // Responsive sizes attribute for better selection
  sizes?: string;
  referrerPolicy?:
    | "no-referrer"
    | "no-referrer-when-downgrade"
    | "origin"
    | "origin-when-cross-origin"
    | "same-origin"
    | "strict-origin"
    | "strict-origin-when-cross-origin"
    | "unsafe-url";
  dataTestId?: string;
  fallbackSrc?: string;
}

export default function OptimizedImage({
  src,
  alt,
  className = "",
  width,
  height,
  loading = "lazy",
  fetchPriority,
  sizes,
  referrerPolicy,
  dataTestId,
  fallbackSrc,
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [webpSupported, setWebpSupported] = useState<boolean | null>(null);

  // Check WebP support on component mount
  React.useEffect(() => {
    const checkWebPSupport = () => {
      const webp = new Image();
      webp.onload = webp.onerror = () => {
        setWebpSupported(webp.height === 2);
      };
      webp.src =
        "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
    };

    checkWebPSupport();
  }, []);

  // Generate WebP URL for supported sources
  const getWebPUrl = (originalSrc: string): string => {
    // For YouTube thumbnails, keep original JPG format to avoid 404s
    // YouTube doesn't always have WebP versions available
    if (originalSrc.includes("i.ytimg.com")) {
      return originalSrc; // Use original JPG format
    }

    // For our R2 assets, try to use WebP version
    if (originalSrc.includes("pub-51f3a9919deb45cfbc4c98a1b2aec929.r2.dev")) {
      return originalSrc.replace(".png", ".webp").replace(".jpg", ".webp");
    }

    // For Vercel storage assets, they're already WebP
    if (
      originalSrc.includes("v5igaday0pxfwtzb.public.blob.vercel-storage.com")
    ) {
      return originalSrc; // Already WebP
    }

    return originalSrc;
  };

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
    }
  };

  // Determine which image source to use
  const getImageSrc = (): string => {
    // If WebP failed or not supported, use original
    if (imageError || webpSupported === false) {
      return fallbackSrc || src;
    }

    // If WebP is supported, try WebP version
    if (webpSupported === true) {
      return getWebPUrl(src);
    }

    // While checking WebP support, use original
    return src;
  };

  return (
    <img
      src={getImageSrc()}
      alt={alt}
      className={cn(className)}
      width={width}
      height={height}
      loading={loading}
      fetchpriority={fetchPriority}
      sizes={sizes}
      referrerPolicy={referrerPolicy}
      data-testid={dataTestId}
      onError={handleImageError}
    />
  );
}
