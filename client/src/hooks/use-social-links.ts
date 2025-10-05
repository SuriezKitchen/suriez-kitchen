import type { SocialLink } from "@shared/schema";

// Hardcoded social links - no database needed
const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  {
    id: "youtube",
    platform: "youtube",
    username: "@Sureiyahsaid",
    url: "https://youtube.com/@Sureiyahsaid",
  },
  {
    id: "instagram",
    platform: "instagram",
    username: "@suriezkitchen",
    url: "https://instagram.com/suriezkitchen",
  },
];

export function useSocialLinks() {
  // Return hardcoded social links - no need for API calls or database
  return {
    data: DEFAULT_SOCIAL_LINKS,
    isLoading: false,
    error: null,
  };
}

