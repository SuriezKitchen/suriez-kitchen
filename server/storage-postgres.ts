import {
  type Dish,
  type InsertDish,
  type Video,
  type InsertVideo,
  type SocialLink,
  type InsertSocialLink,
  type Category,
  type InsertCategory,
  type Setting,
  type InsertSetting,
  type AdminUser,
  type InsertAdminUser,
  dishes,
  videos,
  socialLinks,
  categories,
  settings,
  adminUsers,
} from "@shared/schema-postgres";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";

export interface IStorage {
  getDishes(): Promise<Dish[]>;
  getDish(id: string): Promise<Dish | undefined>;
  createDish(dish: InsertDish): Promise<Dish>;
  updateDish(id: string, dish: Partial<InsertDish>): Promise<Dish | undefined>;
  deleteDish(id: string): Promise<boolean>;
  
  getVideos(): Promise<Video[]>;
  getVideo(id: string): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: string, video: Partial<InsertVideo>): Promise<Video | undefined>;
  deleteVideo(id: string): Promise<boolean>;
  
  getSocialLinks(): Promise<SocialLink[]>;
  getSocialLink(id: string): Promise<SocialLink | undefined>;
  createSocialLink(socialLink: InsertSocialLink): Promise<SocialLink>;
  updateSocialLink(id: string, socialLink: Partial<InsertSocialLink>): Promise<SocialLink | undefined>;
  deleteSocialLink(id: string): Promise<boolean>;
  
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;
  
  getSettings(): Promise<Setting[]>;
  getSetting(key: string): Promise<Setting | undefined>;
  createSetting(setting: InsertSetting): Promise<Setting>;
  updateSetting(key: string, setting: Partial<InsertSetting>): Promise<Setting | undefined>;
  deleteSetting(key: string): Promise<boolean>;
  
  getAdminUsers(): Promise<AdminUser[]>;
  getAdminUser(id: string): Promise<AdminUser | undefined>;
  getAdminUserByUsername(username: string): Promise<AdminUser | undefined>;
  createAdminUser(adminUser: InsertAdminUser): Promise<AdminUser>;
  updateAdminUser(id: string, adminUser: Partial<InsertAdminUser>): Promise<AdminUser | undefined>;
  deleteAdminUser(id: string): Promise<boolean>;
}

export class PostgresStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;
  private sql: postgres.Sql;

  constructor() {
    const connectionString = process.env.POSTGRES_URL;
    if (!connectionString) {
      throw new Error("POSTGRES_URL environment variable is required");
    }
    
    this.sql = postgres(connectionString);
    this.db = drizzle(this.sql);
  }

  async getDishes(): Promise<Dish[]> {
    return await this.db.select().from(dishes);
  }

  async getDish(id: string): Promise<Dish | undefined> {
    const result = await this.db.select().from(dishes).where(eq(dishes.id, id));
    return result[0];
  }

  async createDish(dish: InsertDish): Promise<Dish> {
    const newDish = {
      ...dish,
      id: randomUUID(),
      createdAt: new Date(),
    };
    await this.db.insert(dishes).values(newDish);
    return newDish as Dish;
  }

  async updateDish(id: string, dish: Partial<InsertDish>): Promise<Dish | undefined> {
    await this.db.update(dishes).set(dish).where(eq(dishes.id, id));
    return await this.getDish(id);
  }

  async deleteDish(id: string): Promise<boolean> {
    const result = await this.db.delete(dishes).where(eq(dishes.id, id));
    return result.length > 0;
  }

  async getVideos(): Promise<Video[]> {
    return await this.db.select().from(videos);
  }

  async getVideo(id: string): Promise<Video | undefined> {
    const result = await this.db.select().from(videos).where(eq(videos.id, id));
    return result[0];
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const newVideo = {
      ...video,
      id: randomUUID(),
      createdAt: new Date(),
    };
    await this.db.insert(videos).values(newVideo);
    return newVideo as Video;
  }

  async updateVideo(id: string, video: Partial<InsertVideo>): Promise<Video | undefined> {
    await this.db.update(videos).set(video).where(eq(videos.id, id));
    return await this.getVideo(id);
  }

  async deleteVideo(id: string): Promise<boolean> {
    const result = await this.db.delete(videos).where(eq(videos.id, id));
    return result.length > 0;
  }

  async getSocialLinks(): Promise<SocialLink[]> {
    return await this.db.select().from(socialLinks);
  }

  async getSocialLink(id: string): Promise<SocialLink | undefined> {
    const result = await this.db.select().from(socialLinks).where(eq(socialLinks.id, id));
    return result[0];
  }

  async createSocialLink(socialLink: InsertSocialLink): Promise<SocialLink> {
    const newSocialLink = {
      ...socialLink,
      id: randomUUID(),
      createdAt: new Date(),
    };
    await this.db.insert(socialLinks).values(newSocialLink);
    return newSocialLink as SocialLink;
  }

  async updateSocialLink(id: string, socialLink: Partial<InsertSocialLink>): Promise<SocialLink | undefined> {
    await this.db.update(socialLinks).set(socialLink).where(eq(socialLinks.id, id));
    return await this.getSocialLink(id);
  }

  async deleteSocialLink(id: string): Promise<boolean> {
    const result = await this.db.delete(socialLinks).where(eq(socialLinks.id, id));
    return result.length > 0;
  }

  async getCategories(): Promise<Category[]> {
    return await this.db.select().from(categories);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const result = await this.db.select().from(categories).where(eq(categories.id, id));
    return result[0];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const newCategory = {
      ...category,
      id: randomUUID(),
      createdAt: new Date(),
    };
    await this.db.insert(categories).values(newCategory);
    return newCategory as Category;
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined> {
    await this.db.update(categories).set(category).where(eq(categories.id, id));
    return await this.getCategory(id);
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await this.db.delete(categories).where(eq(categories.id, id));
    return result.length > 0;
  }

  async getSettings(): Promise<Setting[]> {
    return await this.db.select().from(settings);
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    const result = await this.db.select().from(settings).where(eq(settings.key, key));
    return result[0];
  }

  async createSetting(setting: InsertSetting): Promise<Setting> {
    const newSetting = {
      ...setting,
      createdAt: new Date(),
    };
    await this.db.insert(settings).values(newSetting);
    return {
      id: randomUUID(),
      key: newSetting.key,
      value: newSetting.value,
      description: newSetting.description || null,
      updatedAt: new Date(),
    } as Setting;
  }

  async updateSetting(key: string, setting: Partial<InsertSetting>): Promise<Setting | undefined> {
    await this.db.update(settings).set(setting).where(eq(settings.key, key));
    return await this.getSetting(key);
  }

  async deleteSetting(key: string): Promise<boolean> {
    const result = await this.db.delete(settings).where(eq(settings.key, key));
    return result.length > 0;
  }

  async getAdminUsers(): Promise<AdminUser[]> {
    return await this.db.select().from(adminUsers);
  }

  async getAdminUser(id: string): Promise<AdminUser | undefined> {
    const result = await this.db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return result[0];
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    const result = await this.db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return result[0];
  }

  async createAdminUser(adminUser: InsertAdminUser): Promise<AdminUser> {
    const newAdminUser = {
      ...adminUser,
      id: randomUUID(),
      createdAt: new Date(),
    };
    await this.db.insert(adminUsers).values(newAdminUser);
    return newAdminUser as AdminUser;
  }

  async updateAdminUser(id: string, adminUser: Partial<InsertAdminUser>): Promise<AdminUser | undefined> {
    await this.db.update(adminUsers).set(adminUser).where(eq(adminUsers.id, id));
    return await this.getAdminUser(id);
  }

  async deleteAdminUser(id: string): Promise<boolean> {
    const result = await this.db.delete(adminUsers).where(eq(adminUsers.id, id));
    return result.length > 0;
  }
}
