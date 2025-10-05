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
} from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-serverless";
import { eq, sql } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
// Local SQLite (for Express dev server)
import Database from "better-sqlite3";

export interface IStorage {
  getDishes(): Promise<Dish[]>;
  getDish(id: string): Promise<Dish | undefined>;
  createDish(dish: InsertDish): Promise<Dish>;
  updateDish(id: string, updates: Partial<InsertDish>): Promise<Dish>;
  deleteDish(id: string): Promise<void>;

  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(
    id: string,
    updates: Partial<InsertCategory>
  ): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  getVideos(): Promise<Video[]>;
  getVideo(id: string): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;

  getSocialLinks(): Promise<SocialLink[]>;
  createSocialLink(link: InsertSocialLink): Promise<SocialLink>;

  // Settings methods
  getSettings(): Promise<Setting[]>;
  getSetting(key: string): Promise<Setting | null>;
  createSetting(
    key: string,
    value: string,
    description?: string
  ): Promise<Setting>;
  updateSetting(
    key: string,
    value: string,
    description?: string
  ): Promise<Setting>;

  // Admin user methods
  getAdminUserByUsername(username: string): Promise<AdminUser | null>;
  createAdminUser(user: InsertAdminUser): Promise<AdminUser>;
  updateAdminUserLastLogin(id: string): Promise<void>;
  updateAdminUserPassword(id: string, passwordHash: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private dishes: Map<string, Dish>;
  private videos: Map<string, Video>;
  private socialLinks: Map<string, SocialLink>;
  private categories: Map<string, Category>;
  private settings: Map<string, Setting>;
  private adminUsers: Map<string, AdminUser>;

  constructor() {
    this.dishes = new Map();
    this.videos = new Map();
    this.socialLinks = new Map();
    this.categories = new Map();
    this.settings = new Map();
    this.adminUsers = new Map();

    // Initialize with sample data
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    // Sample categories
    const sampleCategories: InsertCategory[] = [
      {
        name: "Breakfast",
        description: "Morning meals and brunch items",
        color: "#F59E0B", // Amber
        isActive: true,
      },
      {
        name: "Rice",
        description: "Rice-based dishes and grains",
        color: "#10B981", // Emerald
        isActive: true,
      },
      {
        name: "Poultry",
        description: "Chicken, turkey, and other bird dishes",
        color: "#EF4444", // Red
        isActive: true,
      },
      {
        name: "Salad",
        description: "Fresh salads and vegetable dishes",
        color: "#22C55E", // Green
        isActive: true,
      },
      {
        name: "Seafood",
        description: "Fish and seafood dishes",
        color: "#3B82F6", // Blue
        isActive: true,
      },
      {
        name: "Meat",
        description: "Beef, pork, and other meat dishes",
        color: "#8B5CF6", // Purple
        isActive: true,
      },
      {
        name: "Dessert",
        description: "Sweet treats and desserts",
        color: "#EC4899", // Pink
        isActive: true,
      },
      {
        name: "Pasta",
        description: "Pasta and noodle dishes",
        color: "#F97316", // Orange
        isActive: true,
      },
      {
        name: "Vegetarian",
        description: "Plant-based dishes",
        color: "#84CC16", // Lime
        isActive: true,
      },
      {
        name: "Mediterranean",
        description: "Mediterranean cuisine",
        color: "#06B6D4", // Cyan
        isActive: true,
      },
    ];

    // Initialize categories
    for (const category of sampleCategories) {
      const id = randomUUID();
      this.categories.set(id, {
        id,
        ...category,
        createdAt: new Date(),
      });
    }

    // Sample dishes
    const sampleDishes: InsertDish[] = [
      {
        title: "Ocean's Bounty",
        description: "Fresh seafood medley with citrus reduction",
        imageUrl:
          "https://images.unsplash.com/photo-1562967914-608f82629710?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        category: "Seafood",
      },
      {
        title: "Truffle Linguine",
        description: "Hand-made pasta with black truffle shavings",
        imageUrl:
          "https://images.unsplash.com/photo-1551183053-bf91a1d81141?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        category: "Pasta",
      },
      {
        title: "Prime Ribeye",
        description: "Perfectly aged beef with seasonal vegetables",
        imageUrl:
          "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        category: "Meat",
      },
      {
        title: "Berry Parfait",
        description: "Layered mousse with seasonal berries",
        imageUrl:
          "https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        category: "Dessert",
      },
      // Additional local sample dishes to match deployed data count
      {
        title: "Herb Roasted Chicken",
        description: "Free-range chicken with rosemary, thyme, and lemon",
        imageUrl:
          "https://images.pexels.com/photos/4106483/pexels-photo-4106483.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        category: "Poultry",
      },
      {
        title: "Seared Salmon",
        description: "Crispy skin salmon with dill yogurt and asparagus",
        imageUrl:
          "https://images.pexels.com/photos/3296273/pexels-photo-3296273.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        category: "Seafood",
      },
      {
        title: "Caprese Salad",
        description: "Heirloom tomatoes, fresh mozzarella, basil & balsamic",
        imageUrl:
          "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        category: "Salad",
      },
      {
        title: "Mushroom Risotto",
        description: "Creamy arborio rice with wild mushrooms and truffle oil",
        imageUrl:
          "https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        category: "Rice",
      },
      {
        title: "Shrimp Scampi",
        description: "Garlic butter shrimp with lemon and parsley",
        imageUrl:
          "https://images.pexels.com/photos/960985/pexels-photo-960985.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        category: "Seafood",
      },
      {
        title: "Veggie Buddha Bowl",
        description: "Roasted veggies, quinoa, and tahini dressing",
        imageUrl:
          "https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        category: "Vegetarian",
      },
      {
        title: "Beef Bourguignon",
        description: "Slow-braised beef with red wine and root vegetables",
        imageUrl:
          "https://images.pexels.com/photos/4106484/pexels-photo-4106484.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        category: "Meat",
      },
      {
        title: "Avocado Toast",
        description: "Sourdough toast with smashed avocado and chili flakes",
        imageUrl:
          "https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        category: "Breakfast",
      },
      {
        title: "Chocolate Lava Cake",
        description: "Warm chocolate cake with molten center",
        imageUrl:
          "https://images.pexels.com/photos/4109990/pexels-photo-4109990.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        category: "Dessert",
      },
      {
        title: "Greek Gyro Plate",
        description: "Marinated meat, pita, tzatziki, and salad",
        imageUrl:
          "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        category: "Mediterranean",
      },
      {
        title: "Lobster Thermidor",
        description: "Classic French dish with lobster, cream, and cheese",
        imageUrl:
          "https://images.pexels.com/photos/2291367/pexels-photo-2291367.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        category: "Seafood",
      },
      {
        title: "Wagyu Beef Tartare",
        description: "Premium raw beef with quail egg and truffle oil",
        imageUrl:
          "https://images.pexels.com/photos/4106484/pexels-photo-4106484.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        category: "Meat",
      },
      {
        title: "Tiramisu",
        description: "Classic Italian dessert with coffee and mascarpone",
        imageUrl:
          "https://images.pexels.com/photos/4109990/pexels-photo-4109990.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        category: "Dessert",
      },
      {
        title: "Duck Confit",
        description: "Slow-cooked duck leg with crispy skin and herbs",
        imageUrl:
          "https://images.pexels.com/photos/4106483/pexels-photo-4106483.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        category: "Poultry",
      },
      {
        title: "Caesar Salad",
        description:
          "Romaine lettuce with parmesan, croutons, and anchovy dressing",
        imageUrl:
          "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        category: "Salad",
      },
      {
        title: "Paella Valenciana",
        description: "Spanish rice dish with saffron, seafood, and vegetables",
        imageUrl:
          "https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        category: "Rice",
      },
      {
        title: "Ratatouille",
        description:
          "Provençal vegetable stew with eggplant, zucchini, and tomatoes",
        imageUrl:
          "https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        category: "Vegetarian",
      },
      {
        title: "Pancakes with Berries",
        description:
          "Fluffy pancakes topped with fresh berries and maple syrup",
        imageUrl:
          "https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        category: "Breakfast",
      },
      {
        title: "Crème Brûlée",
        description: "Rich custard dessert with caramelized sugar topping",
        imageUrl:
          "https://images.pexels.com/photos/4109990/pexels-photo-4109990.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        category: "Dessert",
      },
      {
        title: "Beef Wellington",
        description:
          "Tender beef fillet wrapped in puff pastry with mushroom duxelles",
        imageUrl:
          "https://images.pexels.com/photos/4106484/pexels-photo-4106484.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
        category: "Meat",
      },
    ];

    for (const dish of sampleDishes) {
      await this.createDish(dish);
    }

    // Sample social links
    const sampleSocialLinks: InsertSocialLink[] = [
      {
        platform: "youtube",
        url: "https://youtube.com/@Sureiyahsaid",
        username: "@Sureiyahsaid",
        isActive: true,
      },
      {
        platform: "instagram",
        url: "https://instagram.com/suriez_kitchen",
        username: "@suriez_kitchen",
        isActive: true,
      },
    ];

    for (const link of sampleSocialLinks) {
      await this.createSocialLink(link);
    }
  }

  async getDishes(): Promise<Dish[]> {
    return Array.from(this.dishes.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getDish(id: string): Promise<Dish | undefined> {
    return this.dishes.get(id);
  }

  async updateDish(id: string, updates: Partial<InsertDish>): Promise<Dish> {
    const existing = this.dishes.get(id);
    if (!existing) {
      throw new Error("Dish not found");
    }

    const updated: Dish = {
      ...existing,
      ...updates,
      id,
      createdAt: existing.createdAt,
    };

    this.dishes.set(id, updated);
    return updated;
  }

  async deleteDish(id: string): Promise<void> {
    if (!this.dishes.has(id)) {
      throw new Error("Dish not found");
    }
    this.dishes.delete(id);
  }

  async createDish(insertDish: InsertDish): Promise<Dish> {
    const id = randomUUID();
    const dish: Dish = {
      ...insertDish,
      id,
      createdAt: new Date(),
    };
    this.dishes.set(id, dish);
    return dish;
  }

  async getVideos(): Promise<Video[]> {
    return Array.from(this.videos.values()).sort(
      (a, b) =>
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
      createdAt: new Date(),
    };
    this.videos.set(id, video);
    return video;
  }

  async getSocialLinks(): Promise<SocialLink[]> {
    return Array.from(this.socialLinks.values()).filter(
      (link) => link.isActive
    );
  }

  async createSocialLink(
    insertSocialLink: InsertSocialLink
  ): Promise<SocialLink> {
    const id = randomUUID();
    const link: SocialLink = { ...insertSocialLink, id };
    this.socialLinks.set(id, link);
    return link;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = {
      ...insertCategory,
      id,
      createdAt: new Date(),
    };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(
    id: string,
    updates: Partial<InsertCategory>
  ): Promise<Category> {
    const existing = this.categories.get(id);
    if (!existing) {
      throw new Error("Category not found");
    }

    const updated: Category = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
    };

    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    if (!this.categories.has(id)) {
      throw new Error("Category not found");
    }
    this.categories.delete(id);
  }

  // Settings methods
  async getSettings(): Promise<Setting[]> {
    return Array.from(this.settings.values());
  }

  async getSetting(key: string): Promise<Setting | null> {
    return this.settings.get(key) || null;
  }

  async createSetting(
    key: string,
    value: string,
    description?: string
  ): Promise<Setting> {
    const setting: Setting = {
      id: randomUUID(),
      key,
      value,
      description: description || null,
      updatedAt: new Date(),
    };
    this.settings.set(key, setting);
    return setting;
  }

  async updateSetting(
    key: string,
    value: string,
    description?: string
  ): Promise<Setting> {
    const existing = this.settings.get(key);
    if (!existing) {
      return this.createSetting(key, value, description);
    }

    const updated: Setting = {
      ...existing,
      value,
      description: description || existing.description,
      updatedAt: new Date(),
    };
    this.settings.set(key, updated);
    return updated;
  }

  // Admin user methods
  async getAdminUserByUsername(username: string): Promise<AdminUser | null> {
    for (const user of this.adminUsers.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return null;
  }

  async createAdminUser(user: InsertAdminUser): Promise<AdminUser> {
    const adminUser: AdminUser = {
      id: randomUUID(),
      username: user.username,
      passwordHash: user.passwordHash,
      email: user.email || null,
      isActive: user.isActive ?? true,
      lastLoginAt: null,
      createdAt: new Date(),
    };
    this.adminUsers.set(adminUser.id, adminUser);
    return adminUser;
  }

  async updateAdminUserLastLogin(id: string): Promise<void> {
    const user = this.adminUsers.get(id);
    if (user) {
      user.lastLoginAt = new Date();
      this.adminUsers.set(id, user);
    }
  }

  async updateAdminUserPassword(
    id: string,
    passwordHash: string
  ): Promise<void> {
    const user = this.adminUsers.get(id);
    if (user) {
      user.passwordHash = passwordHash;
      this.adminUsers.set(id, user);
    }
  }
}

export class NeonStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    // For Vercel with Neon, we'll use the Neon serverless driver
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL is required. Make sure you have a Neon PostgreSQL database configured."
      );
    }

    const sql = neon(connectionString);
    this.db = drizzle(sql);
    
    // Initialize tables if they don't exist
    this.initializeTables();
  }

  private async initializeTables() {
    try {
      // Create social_links table if it doesn't exist
      await this.db.execute(sql`
        CREATE TABLE IF NOT EXISTS social_links (
          id TEXT PRIMARY KEY,
          platform TEXT NOT NULL,
          url TEXT NOT NULL,
          username TEXT NOT NULL,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Insert default social links if table is empty
      const existingLinks = await this.db.execute(sql`SELECT COUNT(*) as count FROM social_links`);
      const count = existingLinks.rows[0]?.count || 0;
      
      if (count === 0) {
        await this.db.execute(sql`
          INSERT INTO social_links (id, platform, url, username, is_active) VALUES
          ('default-youtube', 'youtube', 'https://youtube.com/@SuriezKitchen', '@SuriezKitchen', true),
          ('default-instagram', 'instagram', 'https://instagram.com/suriezkitchen', '@suriezkitchen', true)
        `);
      }
    } catch (error) {
      console.error("Error initializing tables:", error);
    }
  }

  async getDishes(): Promise<Dish[]> {
    return await this.db.select().from(dishes).orderBy(dishes.createdAt);
  }

  async getDish(id: string): Promise<Dish | undefined> {
    const result = await this.db
      .select()
      .from(dishes)
      .where(eq(dishes.id, id))
      .limit(1);
    return result[0];
  }

  async updateDish(id: string, updates: Partial<InsertDish>): Promise<Dish> {
    const result = await this.db
      .update(dishes)
      .set(updates)
      .where(eq(dishes.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error("Dish not found");
    }

    return result[0];
  }

  async deleteDish(id: string): Promise<void> {
    const result = await this.db
      .delete(dishes)
      .where(eq(dishes.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error("Dish not found");
    }
  }

  async createDish(insertDish: InsertDish): Promise<Dish> {
    const result = await this.db.insert(dishes).values(insertDish).returning();
    return result[0];
  }

  async getVideos(): Promise<Video[]> {
    return await this.db.select().from(videos).orderBy(videos.publishedAt);
  }

  async getVideo(id: string): Promise<Video | undefined> {
    const result = await this.db
      .select()
      .from(videos)
      .where(eq(videos.id, id))
      .limit(1);
    return result[0];
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const result = await this.db.insert(videos).values(insertVideo).returning();
    return result[0];
  }

  async getSocialLinks(): Promise<SocialLink[]> {
    return await this.db
      .select()
      .from(socialLinks)
      .where(eq(socialLinks.isActive, true));
  }

  async createSocialLink(
    insertSocialLink: InsertSocialLink
  ): Promise<SocialLink> {
    const result = await this.db
      .insert(socialLinks)
      .values(insertSocialLink)
      .returning();
    return result[0];
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return await this.db.select().from(categories).orderBy(categories.name);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const result = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id));
    return result[0];
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const result = await this.db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return result[0];
  }

  async updateCategory(
    id: string,
    updates: Partial<InsertCategory>
  ): Promise<Category> {
    const result = await this.db
      .update(categories)
      .set(updates)
      .where(eq(categories.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error("Category not found");
    }

    return result[0];
  }

  async deleteCategory(id: string): Promise<void> {
    const result = await this.db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error("Category not found");
    }
  }

  // Settings methods
  async getSettings(): Promise<Setting[]> {
    return await this.db.select().from(settings);
  }

  async getSetting(key: string): Promise<Setting | null> {
    const result = await this.db
      .select()
      .from(settings)
      .where(eq(settings.key, key));
    return result[0] || null;
  }

  async createSetting(
    key: string,
    value: string,
    description?: string
  ): Promise<Setting> {
    const insertSetting: InsertSetting = {
      key,
      value,
      description: description || null,
    };

    const result = await this.db
      .insert(settings)
      .values(insertSetting)
      .returning();
    return result[0];
  }

  async updateSetting(
    key: string,
    value: string,
    description?: string
  ): Promise<Setting> {
    const existing = await this.getSetting(key);
    if (!existing) {
      return this.createSetting(key, value, description);
    }

    const result = await this.db
      .update(settings)
      .set({
        value,
        description: description || existing.description,
        updatedAt: new Date(),
      })
      .where(eq(settings.key, key))
      .returning();
    return result[0];
  }

  // Admin user methods
  async getAdminUserByUsername(username: string): Promise<AdminUser | null> {
    const result = await this.db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username));
    return result[0] || null;
  }

  async createAdminUser(user: InsertAdminUser): Promise<AdminUser> {
    const result = await this.db.insert(adminUsers).values(user).returning();
    return result[0];
  }

  async updateAdminUserLastLogin(id: string): Promise<void> {
    await this.db
      .update(adminUsers)
      .set({ lastLoginAt: new Date() })
      .where(eq(adminUsers.id, id));
  }

  async updateAdminUserPassword(
    id: string,
    passwordHash: string
  ): Promise<void> {
    await this.db
      .update(adminUsers)
      .set({ passwordHash })
      .where(eq(adminUsers.id, id));
  }
}

// SQLite storage for local Express dev (http://localhost:5174)
export class SqliteStorage implements IStorage {
  private db: Database.Database;

  constructor(filePath: string = "./local.db") {
    this.db = new Database(filePath);
    this.db.pragma("journal_mode = WAL");
    // Create tables if not exist
    this.db
      .prepare(
        `CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          description TEXT,
          color TEXT DEFAULT '#3B82F6',
          is_active INTEGER DEFAULT 1,
          created_at INTEGER NOT NULL
        )`
      )
      .run();

    this.db
      .prepare(
        `CREATE TABLE IF NOT EXISTS dishes (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          image_url TEXT NOT NULL,
          category TEXT NOT NULL,
          created_at INTEGER NOT NULL
        )`
      )
      .run();

    this.db
      .prepare(
        `CREATE TABLE IF NOT EXISTS social_links (
          id TEXT PRIMARY KEY,
          platform TEXT NOT NULL,
          url TEXT NOT NULL,
          username TEXT NOT NULL,
          is_active INTEGER NOT NULL
        )`
      )
      .run();

    this.db
      .prepare(
        `CREATE TABLE IF NOT EXISTS videos (
          id TEXT PRIMARY KEY,
          youtube_id TEXT,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          thumbnail_url TEXT,
          published_at INTEGER,
          view_count INTEGER,
          like_count INTEGER
        )`
      )
      .run();

    // Seed with sample categories if empty
    const categoryRow = this.db
      .prepare("SELECT COUNT(*) as count FROM categories")
      .get() as { count: number };
    if (categoryRow.count === 0) {
      const insertCategory = this.db.prepare(
        `INSERT INTO categories (id, name, description, color, is_active, created_at)
         VALUES (@id, @name, @description, @color, @is_active, @created_at)`
      );
      const now = Date.now();
      const sampleCategories = [
        {
          id: randomUUID(),
          name: "Breakfast",
          description: "Morning meals and brunch items",
          color: "#F59E0B",
          is_active: 1,
          created_at: now,
        },
        {
          id: randomUUID(),
          name: "Rice",
          description: "Rice-based dishes and grains",
          color: "#10B981",
          is_active: 1,
          created_at: now,
        },
        {
          id: randomUUID(),
          name: "Poultry",
          description: "Chicken, turkey, and other bird dishes",
          color: "#EF4444",
          is_active: 1,
          created_at: now,
        },
        {
          id: randomUUID(),
          name: "Salad",
          description: "Fresh salads and vegetable dishes",
          color: "#22C55E",
          is_active: 1,
          created_at: now,
        },
        {
          id: randomUUID(),
          name: "Seafood",
          description: "Fish and seafood dishes",
          color: "#3B82F6",
          is_active: 1,
          created_at: now,
        },
        {
          id: randomUUID(),
          name: "Meat",
          description: "Beef, pork, and other meat dishes",
          color: "#8B5CF6",
          is_active: 1,
          created_at: now,
        },
        {
          id: randomUUID(),
          name: "Dessert",
          description: "Sweet treats and desserts",
          color: "#EC4899",
          is_active: 1,
          created_at: now,
        },
        {
          id: randomUUID(),
          name: "Pasta",
          description: "Pasta and noodle dishes",
          color: "#F97316",
          is_active: 1,
          created_at: now,
        },
        {
          id: randomUUID(),
          name: "Vegetarian",
          description: "Plant-based dishes",
          color: "#84CC16",
          is_active: 1,
          created_at: now,
        },
        {
          id: randomUUID(),
          name: "Mediterranean",
          description: "Mediterranean cuisine",
          color: "#06B6D4",
          is_active: 1,
          created_at: now,
        },
      ];
      for (const category of sampleCategories) {
        insertCategory.run(category);
      }
    }

    // Seed if empty
    const row = this.db
      .prepare("SELECT COUNT(*) as count FROM dishes")
      .get() as { count: number };
    if (row.count === 0) {
      const insert = this.db.prepare(
        `INSERT INTO dishes (id, title, description, image_url, category, created_at)
         VALUES (@id, @title, @description, @image_url, @category, @created_at)`
      );
      const now = Date.now();
      const seed: Array<
        Omit<Dish, "createdAt"> & { created_at: number; image_url: string }
      > = [
        {
          id: randomUUID(),
          title: "Ocean's Bounty",
          description: "Fresh seafood medley with citrus reduction",
          image_url:
            "https://images.unsplash.com/photo-1562967914-608f82629710?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          category: "Seafood",
          created_at: now,
        },
        {
          id: randomUUID(),
          title: "Truffle Linguine",
          description:
            "Hand-made pasta with black truffle shavings and parmesan",
          image_url:
            "https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          category: "Pasta",
          created_at: now,
        },
        {
          id: randomUUID(),
          title: "Prime Ribeye",
          description:
            "Perfectly aged beef with seasonal vegetables and red wine reduction",
          image_url:
            "https://images.pexels.com/photos/4106484/pexels-photo-4106484.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          category: "Meat",
          created_at: now,
        },
        {
          id: randomUUID(),
          title: "Berry Parfait",
          description: "Layered mousse with seasonal berries and mint",
          image_url:
            "https://images.pexels.com/photos/4109990/pexels-photo-4109990.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          category: "Dessert",
          created_at: now,
        },
        {
          id: randomUUID(),
          title: "Herb Roasted Chicken",
          description: "Free-range chicken with rosemary, thyme, and lemon",
          image_url:
            "https://images.pexels.com/photos/4106483/pexels-photo-4106483.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          category: "Poultry",
          created_at: now,
        },
        {
          id: randomUUID(),
          title: "Seared Salmon",
          description: "Crispy skin salmon with dill yogurt and asparagus",
          image_url:
            "https://images.pexels.com/photos/3296273/pexels-photo-3296273.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          category: "Seafood",
          created_at: now,
        },
        {
          id: randomUUID(),
          title: "Caprese Salad",
          description: "Heirloom tomatoes, fresh mozzarella, basil & balsamic",
          image_url:
            "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          category: "Salad",
          created_at: now,
        },
        {
          id: randomUUID(),
          title: "Mushroom Risotto",
          description:
            "Creamy arborio rice with wild mushrooms and truffle oil",
          image_url:
            "https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          category: "Rice",
          created_at: now,
        },
        {
          id: randomUUID(),
          title: "Shrimp Scampi",
          description: "Garlic butter shrimp with lemon and parsley",
          image_url:
            "https://images.pexels.com/photos/960985/pexels-photo-960985.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          category: "Seafood",
          created_at: now,
        },
        {
          id: randomUUID(),
          title: "Veggie Buddha Bowl",
          description: "Roasted veggies, quinoa, and tahini dressing",
          image_url:
            "https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          category: "Vegetarian",
          created_at: now,
        },
        {
          id: randomUUID(),
          title: "Beef Bourguignon",
          description: "Slow-braised beef with red wine and root vegetables",
          image_url:
            "https://images.pexels.com/photos/4106484/pexels-photo-4106484.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          category: "Meat",
          created_at: now,
        },
        {
          id: randomUUID(),
          title: "Avocado Toast",
          description: "Sourdough toast with smashed avocado and chili flakes",
          image_url:
            "https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          category: "Breakfast",
          created_at: now,
        },
        {
          id: randomUUID(),
          title: "Chocolate Lava Cake",
          description: "Warm chocolate cake with molten center",
          image_url:
            "https://images.pexels.com/photos/4109990/pexels-photo-4109990.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          category: "Dessert",
          created_at: now,
        },
        {
          id: randomUUID(),
          title: "Greek Gyro Plate",
          description: "Marinated meat, pita, tzatziki, and salad",
          image_url:
            "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          category: "Mediterranean",
          created_at: now,
        },
        {
          id: randomUUID(),
          title: "Lobster Thermidor",
          description: "Classic French dish with lobster, cream, and cheese",
          image_url:
            "https://images.pexels.com/photos/2291367/pexels-photo-2291367.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          category: "Seafood",
          created_at: now,
        },
        {
          id: randomUUID(),
          title: "Wagyu Beef Tartare",
          description: "Premium raw beef with quail egg and truffle oil",
          image_url:
            "https://images.pexels.com/photos/4106484/pexels-photo-4106484.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          category: "Meat",
          created_at: now,
        },
        {
          id: randomUUID(),
          title: "Tiramisu",
          description: "Classic Italian dessert with coffee and mascarpone",
          image_url:
            "https://images.pexels.com/photos/4109990/pexels-photo-4109990.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          category: "Dessert",
          created_at: now,
        },
        {
          id: randomUUID(),
          title: "Duck Confit",
          description: "Slow-cooked duck leg with crispy skin and herbs",
          image_url:
            "https://images.pexels.com/photos/4106483/pexels-photo-4106483.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          category: "Poultry",
          created_at: now,
        },
        {
          id: randomUUID(),
          title: "Caesar Salad",
          description:
            "Romaine lettuce with parmesan, croutons, and anchovy dressing",
          image_url:
            "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          category: "Salad",
          created_at: now,
        },
        {
          id: randomUUID(),
          title: "Paella Valenciana",
          description:
            "Spanish rice dish with saffron, seafood, and vegetables",
          image_url:
            "https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          category: "Rice",
          created_at: now,
        },
        {
          id: randomUUID(),
          title: "Ratatouille",
          description:
            "Provençal vegetable stew with eggplant, zucchini, and tomatoes",
          image_url:
            "https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          category: "Vegetarian",
          created_at: now,
        },
        {
          id: randomUUID(),
          title: "Pancakes with Berries",
          description:
            "Fluffy pancakes topped with fresh berries and maple syrup",
          image_url:
            "https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          category: "Breakfast",
          created_at: now,
        },
        {
          id: randomUUID(),
          title: "Crème Brûlée",
          description: "Rich custard dessert with caramelized sugar topping",
          image_url:
            "https://images.pexels.com/photos/4109990/pexels-photo-4109990.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          category: "Dessert",
          created_at: now,
        },
        {
          id: randomUUID(),
          title: "Beef Wellington",
          description:
            "Tender beef fillet wrapped in puff pastry with mushroom duxelles",
          image_url:
            "https://images.pexels.com/photos/4106484/pexels-photo-4106484.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          category: "Meat",
          created_at: now,
        },
      ];
      const insertMany = this.db.transaction((rows: typeof seed) => {
        for (const r of rows) insert.run(r);
      });
      insertMany(seed);
    }
  }

  async getDishes(): Promise<Dish[]> {
    const rows = this.db
      .prepare(
        "SELECT id, title, description, image_url as imageUrl, category, created_at as createdAt FROM dishes ORDER BY created_at DESC"
      )
      .all() as Array<{
      id: string;
      title: string;
      description: string;
      imageUrl: string;
      category: string;
      createdAt: number;
    }>;
    return rows.map((r) => ({ ...r, createdAt: new Date(r.createdAt) }));
  }

  async getDish(id: string): Promise<Dish | undefined> {
    const r = this.db
      .prepare(
        "SELECT id, title, description, image_url as imageUrl, category, created_at as createdAt FROM dishes WHERE id = ?"
      )
      .get(id) as any;
    return r ? { ...r, createdAt: new Date(r.createdAt) } : undefined;
  }

  async updateDish(id: string, updates: Partial<InsertDish>): Promise<Dish> {
    const setClause = Object.keys(updates)
      .map((key) => `${key === "imageUrl" ? "image_url" : key} = ?`)
      .join(", ");

    const values = Object.values(updates);
    values.push(id);

    const stmt = this.db.prepare(`UPDATE dishes SET ${setClause} WHERE id = ?`);

    const result = stmt.run(...values);

    if (result.changes === 0) {
      throw new Error("Dish not found");
    }

    return this.getDish(id)!;
  }

  async deleteDish(id: string): Promise<void> {
    const stmt = this.db.prepare("DELETE FROM dishes WHERE id = ?");
    const result = stmt.run(id);

    if (result.changes === 0) {
      throw new Error("Dish not found");
    }
  }

  async createDish(insertDish: InsertDish): Promise<Dish> {
    const id = randomUUID();
    const createdAt = Date.now();
    this.db
      .prepare(
        "INSERT INTO dishes (id, title, description, image_url, category, created_at) VALUES (?,?,?,?,?,?)"
      )
      .run(
        id,
        insertDish.title,
        insertDish.description,
        insertDish.imageUrl,
        insertDish.category,
        createdAt
      );
    return { id, ...insertDish, createdAt: new Date(createdAt) } as Dish;
  }

  // For brevity, videos/social links can remain no-ops for now since gallery uses dishes
  async getVideos(): Promise<Video[]> {
    return [];
  }
  async getVideo(_id: string): Promise<Video | undefined> {
    return undefined;
  }
  async createVideo(video: InsertVideo): Promise<Video> {
    return { ...(video as any), id: randomUUID(), createdAt: new Date() };
  }

  async getSocialLinks(): Promise<SocialLink[]> {
    const rows = this.db
      .prepare(
        "SELECT id, platform, url, username, is_active as isActive FROM social_links WHERE is_active = 1"
      )
      .all() as any[];
    return rows;
  }
  async createSocialLink(link: InsertSocialLink): Promise<SocialLink> {
    const id = randomUUID();
    this.db
      .prepare(
        "INSERT INTO social_links (id, platform, url, username, is_active) VALUES (?,?,?,?,?)"
      )
      .run(id, link.platform, link.url, link.username, link.isActive ? 1 : 0);
    return { id, ...link } as SocialLink;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    const rows = this.db
      .prepare(
        "SELECT id, name, description, color, is_active as isActive, created_at as createdAt FROM categories WHERE is_active = 1 ORDER BY name"
      )
      .all() as Array<{
      id: string;
      name: string;
      description: string | null;
      color: string;
      isActive: number;
      createdAt: number;
    }>;

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      color: row.color,
      isActive: Boolean(row.isActive),
      createdAt: new Date(row.createdAt),
    }));
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const row = this.db
      .prepare(
        "SELECT id, name, description, color, is_active as isActive, created_at as createdAt FROM categories WHERE id = ?"
      )
      .get(id) as
      | {
          id: string;
          name: string;
          description: string | null;
          color: string;
          isActive: number;
          createdAt: number;
        }
      | undefined;

    if (!row) return undefined;

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      color: row.color,
      isActive: Boolean(row.isActive),
      createdAt: new Date(row.createdAt),
    };
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const createdAt = Date.now();
    this.db
      .prepare(
        "INSERT INTO categories (id, name, description, color, is_active, created_at) VALUES (?,?,?,?,?,?)"
      )
      .run(
        id,
        insertCategory.name,
        insertCategory.description,
        insertCategory.color,
        insertCategory.isActive ? 1 : 0,
        createdAt
      );
    return {
      id,
      ...insertCategory,
      createdAt: new Date(createdAt),
    } as Category;
  }

  async updateCategory(
    id: string,
    updates: Partial<InsertCategory>
  ): Promise<Category> {
    const setClause = Object.keys(updates)
      .map((key) => `${key === "isActive" ? "is_active" : key} = ?`)
      .join(", ");

    const values = Object.values(updates).map((value) =>
      typeof value === "boolean" ? (value ? 1 : 0) : value
    );
    values.push(id);

    const stmt = this.db.prepare(
      `UPDATE categories SET ${setClause} WHERE id = ?`
    );
    const result = stmt.run(...values);

    if (result.changes === 0) {
      throw new Error("Category not found");
    }

    return this.getCategory(id)!;
  }

  async deleteCategory(id: string): Promise<void> {
    const stmt = this.db.prepare("DELETE FROM categories WHERE id = ?");
    const result = stmt.run(id);

    if (result.changes === 0) {
      throw new Error("Category not found");
    }
  }

  // Settings methods
  async getSettings(): Promise<Setting[]> {
    const stmt = this.db.prepare("SELECT * FROM settings");
    const rows = stmt.all() as any[];
    return rows.map((row) => ({
      id: row.id,
      key: row.key,
      value: row.value,
      description: row.description,
      updatedAt: new Date(row.updated_at),
    }));
  }

  async getSetting(key: string): Promise<Setting | null> {
    const stmt = this.db.prepare("SELECT * FROM settings WHERE key = ?");
    const row = stmt.get(key) as any;

    if (!row) return null;

    return {
      id: row.id,
      key: row.key,
      value: row.value,
      description: row.description,
      updatedAt: new Date(row.updated_at),
    };
  }

  async createSetting(
    key: string,
    value: string,
    description?: string
  ): Promise<Setting> {
    const id = randomUUID();
    const stmt = this.db.prepare(
      "INSERT INTO settings (id, key, value, description, updated_at) VALUES (?, ?, ?, ?, ?)"
    );
    stmt.run(id, key, value, description || null, new Date().toISOString());

    return {
      id,
      key,
      value,
      description: description || null,
      updatedAt: new Date(),
    };
  }

  async updateSetting(
    key: string,
    value: string,
    description?: string
  ): Promise<Setting> {
    const existing = await this.getSetting(key);
    if (!existing) {
      return this.createSetting(key, value, description);
    }

    const stmt = this.db.prepare(
      "UPDATE settings SET value = ?, description = ?, updated_at = ? WHERE key = ?"
    );
    stmt.run(
      value,
      description || existing.description,
      new Date().toISOString(),
      key
    );

    return {
      ...existing,
      value,
      description: description || existing.description,
      updatedAt: new Date(),
    };
  }

  // Admin user methods
  async getAdminUserByUsername(username: string): Promise<AdminUser | null> {
    const stmt = this.db.prepare(
      "SELECT * FROM admin_users WHERE username = ?"
    );
    const row = stmt.get(username) as any;

    if (!row) return null;

    return {
      id: row.id,
      username: row.username,
      passwordHash: row.password_hash,
      email: row.email,
      isActive: Boolean(row.is_active),
      lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : null,
      createdAt: new Date(row.created_at),
    };
  }

  async createAdminUser(user: InsertAdminUser): Promise<AdminUser> {
    const id = randomUUID();
    const stmt = this.db.prepare(
      "INSERT INTO admin_users (id, username, password_hash, email, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    );
    stmt.run(
      id,
      user.username,
      user.passwordHash,
      user.email || null,
      user.isActive ? 1 : 0,
      new Date().toISOString()
    );

    return {
      id,
      username: user.username,
      passwordHash: user.passwordHash,
      email: user.email || null,
      isActive: user.isActive ?? true,
      lastLoginAt: null,
      createdAt: new Date(),
    };
  }

  async updateAdminUserLastLogin(id: string): Promise<void> {
    const stmt = this.db.prepare(
      "UPDATE admin_users SET last_login_at = ? WHERE id = ?"
    );
    stmt.run(new Date().toISOString(), id);
  }

  async updateAdminUserPassword(
    id: string,
    passwordHash: string
  ): Promise<void> {
    const stmt = this.db.prepare(
      "UPDATE admin_users SET password_hash = ? WHERE id = ?"
    );
    stmt.run(passwordHash, id);
  }
}

// Choose storage based on environment
export const storage = process.env.DATABASE_URL
  ? new NeonStorage()
  : process.env.NODE_ENV === "development"
  ? new SqliteStorage()
  : new MemStorage();
