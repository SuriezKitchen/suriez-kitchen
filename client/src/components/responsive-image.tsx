import React, { useState } from "react";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
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
  sizes?: string;
  quality?: number;
}

export default function ResponsiveImage({
  src,
  alt,
  className = "",
  width,
  height,
  loading = "lazy",
  referrerPolicy = "no-referrer",
  dataTestId,
  fallbackSrc,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  quality = 80,
}: ResponsiveImageProps) {
  const [imageError, setImageError] = useState(false);

  // Generate responsive image URLs for Vercel storage
  const generateResponsiveSrc = (
    originalSrc: string,
    targetWidth: number
  ): string => {
    // For Vercel storage images, we can use URL parameters to resize
    if (
      originalSrc.includes("v5igaday0pxfwtzb.public.blob.vercel-storage.com")
    ) {
      const url = new URL(originalSrc);
      url.searchParams.set("w", targetWidth.toString());
      url.searchParams.set("q", quality.toString());
      return url.toString();
    }

    // For other images, return original
    return originalSrc;
  };

  // Generate srcset for responsive images
  const generateSrcSet = (originalSrc: string): string => {
    const widths = [320, 640, 768, 1024, 1280, 1536];

    return widths
      .map((w) => `${generateResponsiveSrc(originalSrc, w)} ${w}w`)
      .join(", ");
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const currentSrc = () => {
    if (imageError && fallbackSrc) {
      return fallbackSrc;
    }
    return src;
  };

  // For small images (like logos), use a single optimized size
  if (width && width <= 100) {
    const optimizedSrc = generateResponsiveSrc(currentSrc(), width * 2); // 2x for retina

    return (
      <img
        src={optimizedSrc}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading={loading}
        referrerPolicy={referrerPolicy}
        data-testid={dataTestId}
        onError={handleImageError}
      />
    );
  }

  // For larger images, use responsive srcset
  const srcSet = generateSrcSet(currentSrc());
  const fallbackSrcSet = fallbackSrc ? generateSrcSet(fallbackSrc) : undefined;

  return (
    <img
      src={generateResponsiveSrc(currentSrc(), 640)} // Default size
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={loading}
      referrerPolicy={referrerPolicy}
      data-testid={dataTestId}
      onError={handleImageError}
    />
  );
}

