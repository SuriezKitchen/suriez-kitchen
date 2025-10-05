import { useQuery } from "@tanstack/react-query";
import type { SocialLink } from "@shared/schema";

// Default social links as fallback
const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  {
    id: "default-youtube",
    platform: "youtube",
    username: "@SuriezKitchen",
    url: "https://youtube.com/@SuriezKitchen",
  },
  {
    id: "default-instagram",
    platform: "instagram",
    username: "@suriezkitchen",
    url: "https://instagram.com/suriezkitchen",
  },
];

export function useSocialLinks() {
  return useQuery<SocialLink[]>({
    queryKey: ["api", "social-links"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/social-links", {
          // Add timeout to prevent blocking
          signal: AbortSignal.timeout(5000), // 5 second timeout
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        return data.length > 0 ? data : DEFAULT_SOCIAL_LINKS;
      } catch (error) {
        console.warn("Failed to fetch social links, using defaults:", error);
        return DEFAULT_SOCIAL_LINKS;
      }
    },
    // Cache for 10 minutes to reduce API calls
    staleTime: 10 * 60 * 1000,
    // Keep in cache for 30 minutes
    gcTime: 30 * 60 * 1000,
    // Retry only once to avoid blocking
    retry: 1,
    // Don't refetch on window focus for this non-critical data
    refetchOnWindowFocus: false,
    // Use fallback data immediately
    placeholderData: DEFAULT_SOCIAL_LINKS,
  });
}

