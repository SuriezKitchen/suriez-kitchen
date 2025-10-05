import { Suspense, lazy, ComponentType } from "react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

interface LazySectionProps {
  importFunc: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
}

function DefaultFallback() {
  return (
    <div className="py-20 flex items-center justify-center">
      <div className="animate-pulse flex space-x-4 w-full max-w-4xl">
        <div className="flex-1 space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export default function LazySection({
  importFunc,
  fallback = <DefaultFallback />,
  threshold = 0.1,
  rootMargin = "100px",
}: LazySectionProps) {
  const { ref, hasIntersected } = useIntersectionObserver({
    threshold,
    rootMargin,
    triggerOnce: true,
  });

  if (!hasIntersected) {
    return <div ref={ref} className="min-h-[400px]" />;
  }

  const LazyComponent = lazy(importFunc);

  return (
    <Suspense fallback={fallback}>
      <LazyComponent />
    </Suspense>
  );
}
