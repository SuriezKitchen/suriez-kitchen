import { type Dish, type InsertDish, type Video, type InsertVideo, type SocialLink, type InsertSocialLink } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getDishes(): Promise<Dish[]>;
  getDish(id: string): Promise<Dish | undefined>;
  createDish(dish: InsertDish): Promise<Dish>;
  
  getVideos(): Promise<Video[]>;
  getVideo(id: string): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  
  getSocialLinks(): Promise<SocialLink[]>;
  createSocialLink(link: InsertSocialLink): Promise<SocialLink>;
}

export class MemStorage implements IStorage {
  private dishes: Map<string, Dish>;
  private videos: Map<string, Video>;
  private socialLinks: Map<string, SocialLink>;

  constructor() {
    this.dishes = new Map();
    this.videos = new Map();
    this.socialLinks = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    // Sample dishes
    const sampleDishes: InsertDish[] = [
      {
        title: "Ocean's Bounty",
        description: "Fresh seafood medley with citrus reduction",
        imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        category: "Seafood"
      },
      {
        title: "Truffle Linguine",
        description: "Hand-made pasta with black truffle shavings",
        imageUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        category: "Pasta"
      },
      {
        title: "Prime Ribeye",
        description: "Perfectly aged beef with seasonal vegetables",
        imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        category: "Meat"
      },
      {
        title: "Berry Parfait",
        description: "Layered mousse with seasonal berries",
        imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        category: "Dessert"
      }
    ];

    for (const dish of sampleDishes) {
      await this.createDish(dish);
    }

    // Sample social links
    const sampleSocialLinks: InsertSocialLink[] = [
      {
        platform: "youtube",
        url: "https://youtube.com/@chefisabellacooks",
        username: "@ChefIsabellaCooks",
        isActive: true
      },
      {
        platform: "instagram",
        url: "https://instagram.com/chef.isabella",
        username: "@chef.isabella",
        isActive: true
      }
    ];

    for (const link of sampleSocialLinks) {
      await this.createSocialLink(link);
    }
  }

  async getDishes(): Promise<Dish[]> {
    return Array.from(this.dishes.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getDish(id: string): Promise<Dish | undefined> {
    return this.dishes.get(id);
  }

  async createDish(insertDish: InsertDish): Promise<Dish> {
    const id = randomUUID();
    const dish: Dish = { 
      ...insertDish, 
      id,
      createdAt: new Date()
    };
    this.dishes.set(id, dish);
    return dish;
  }

  async getVideos(): Promise<Video[]> {
    return Array.from(this.videos.values()).sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }

  async getVideo(id: string): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const id = randomUUID();
    const video: Video = { 
      ...insertVideo, 
      id,
      createdAt: new Date()
    };
    this.videos.set(id, video);
    return video;
  }

  async getSocialLinks(): Promise<SocialLink[]> {
    return Array.from(this.socialLinks.values()).filter(link => link.isActive);
  }

  async createSocialLink(insertSocialLink: InsertSocialLink): Promise<SocialLink> {
    const id = randomUUID();
    const link: SocialLink = { ...insertSocialLink, id };
    this.socialLinks.set(id, link);
    return link;
  }
}

export const storage = new MemStorage();
