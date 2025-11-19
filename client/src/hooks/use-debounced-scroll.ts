import { useEffect, useRef } from "react";

interface UseDebouncedScrollOptions {
  delay?: number;
  onScroll?: () => void;
}

export function useDebouncedScroll({
  delay = 16,
  onScroll,
}: UseDebouncedScrollOptions = {}) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const rafRef = useRef<number>();

  useEffect(() => {
    const handleScroll = () => {
      // Cancel previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Cancel previous RAF
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // Use requestAnimationFrame to batch scroll events
      rafRef.current = requestAnimationFrame(() => {
        timeoutRef.current = setTimeout(() => {
          onScroll?.();
        }, delay);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [delay, onScroll]);
}
