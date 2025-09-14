import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const dishes = sqliteTable("dishes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const videos = sqliteTable("videos", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  youtubeId: text("youtube_id").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  viewCount: integer("view_count").default(0),
  likeCount: integer("like_count").default(0),
  publishedAt: integer("published_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const categories = sqliteTable("categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  description: text("description"),
  color: text("color").default("#3B82F6"), // Default blue color
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const socialLinks = sqliteTable("social_links", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  platform: text("platform").notNull(),
  url: text("url").notNull(),
  username: text("username"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
});

export const settings = sqliteTable("settings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const adminUsers = sqliteTable("admin_users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  email: text("email"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const insertDishSchema = createInsertSchema(dishes).omit({
  id: true,
  createdAt: true,
});

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertSocialLinkSchema = createInsertSchema(socialLinks).omit({
  id: true,
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
});

export type InsertDish = z.infer<typeof insertDishSchema>;
export type Dish = typeof dishes.$inferSelect;

export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videos.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertSocialLink = z.infer<typeof insertSocialLinkSchema>;
export type SocialLink = typeof socialLinks.$inferSelect;

export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settings.$inferSelect;

export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
