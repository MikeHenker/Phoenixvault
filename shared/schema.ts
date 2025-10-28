import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - for both admin and regular users
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  isApproved: boolean("is_approved").notNull().default(false),
  licenseKey: text("license_key"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  location: text("location"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// License keys table
export const licenses = pgTable("licenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  usedBy: varchar("used_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  usedAt: timestamp("used_at"),
});

// Games table
export const games = pgTable("games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  downloadUrl: text("download_url").notNull().default(''),
  category: text("category").notNull(),
  tags: text("tags").array().notNull().default(sql`ARRAY[]::text[]`),
  featured: boolean("featured").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  averageRating: integer("average_rating").default(0),
  totalRatings: integer("total_ratings").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Download tracking table
export const downloads = pgTable("downloads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameId: varchar("game_id").notNull().references(() => games.id),
  downloadedAt: timestamp("downloaded_at").notNull().defaultNow(),
});

// User library - games added to user's personal collection
export const userLibrary = pgTable("user_library", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameId: varchar("game_id").notNull().references(() => games.id),
  addedAt: timestamp("added_at").notNull().defaultNow(),
  hasLocalFiles: boolean("has_local_files").default(false),
  exePath: text("exe_path"),
});

// Reviews and ratings table
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameId: varchar("game_id").notNull().references(() => games.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Wishlist table
export const wishlist = pgTable("wishlist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameId: varchar("game_id").notNull().references(() => games.id),
  addedAt: timestamp("added_at").notNull().defaultNow(),
});

// Friends/Following system
export const follows = pgTable("follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  followerId: varchar("follower_id").notNull().references(() => users.id),
  followingId: varchar("following_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Achievements table
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull().references(() => games.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  iconUrl: text("icon_url"),
  points: integer("points").notNull().default(10),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// User achievements (unlocked)
export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  achievementId: varchar("achievement_id").notNull().references(() => achievements.id),
  unlockedAt: timestamp("unlocked_at").notNull().defaultNow(),
});

// Playtime tracking
export const playtime = pgTable("playtime", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameId: varchar("game_id").notNull().references(() => games.id),
  totalMinutes: integer("total_minutes").notNull().default(0),
  lastPlayed: timestamp("last_played"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Comments on games
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameId: varchar("game_id").notNull().references(() => games.id),
  content: text("content").notNull(),
  parentId: varchar("parent_id").references((): any => comments.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Game screenshots
export const screenshots = pgTable("screenshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull().references(() => games.id),
  userId: varchar("user_id").references(() => users.id),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Activity feed
export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'download', 'review', 'achievement', 'friend', etc
  gameId: varchar("game_id").references(() => games.id),
  targetUserId: varchar("target_user_id").references(() => users.id),
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  downloads: many(downloads),
  reviews: many(reviews),
  wishlist: many(wishlist),
  library: many(userLibrary),
  followers: many(follows, { relationName: "following" }),
  following: many(follows, { relationName: "follower" }),
  achievements: many(userAchievements),
  playtime: many(playtime),
  comments: many(comments),
  screenshots: many(screenshots),
  activities: many(activities),
  license: one(licenses, {
    fields: [users.licenseKey],
    references: [licenses.key],
  }),
}));

export const licensesRelations = relations(licenses, ({ one }) => ({
  user: one(users, {
    fields: [licenses.usedBy],
    references: [users.id],
  }),
}));

export const gamesRelations = relations(games, ({ many }) => ({
  downloads: many(downloads),
  reviews: many(reviews),
  wishlist: many(wishlist),
  library: many(userLibrary),
  achievements: many(achievements),
  playtime: many(playtime),
  comments: many(comments),
  screenshots: many(screenshots),
}));

export const downloadsRelations = relations(downloads, ({ one }) => ({
  user: one(users, {
    fields: [downloads.userId],
    references: [users.id],
  }),
  game: one(games, {
    fields: [downloads.gameId],
    references: [games.id],
  }),
}));

export const userLibraryRelations = relations(userLibrary, ({ one }) => ({
  user: one(users, {
    fields: [userLibrary.userId],
    references: [users.id],
  }),
  game: one(games, {
    fields: [userLibrary.gameId],
    references: [games.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  game: one(games, {
    fields: [reviews.gameId],
    references: [games.id],
  }),
}));

export const wishlistRelations = relations(wishlist, ({ one }) => ({
  user: one(users, {
    fields: [wishlist.userId],
    references: [users.id],
  }),
  game: one(games, {
    fields: [wishlist.gameId],
    references: [games.id],
  }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    relationName: "follower",
    fields: [follows.followerId],
    references: [users.id],
  }),
  following: one(users, {
    relationName: "following",
    fields: [follows.followingId],
    references: [users.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ one, many }) => ({
  game: one(games, {
    fields: [achievements.gameId],
    references: [games.id],
  }),
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}));

export const playtimeRelations = relations(playtime, ({ one }) => ({
  user: one(users, {
    fields: [playtime.userId],
    references: [users.id],
  }),
  game: one(games, {
    fields: [playtime.gameId],
    references: [games.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  game: one(games, {
    fields: [comments.gameId],
    references: [games.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
  }),
  replies: many(comments),
}));

export const screenshotsRelations = relations(screenshots, ({ one }) => ({
  game: one(games, {
    fields: [screenshots.gameId],
    references: [games.id],
  }),
  user: one(users, {
    fields: [screenshots.userId],
    references: [users.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
  game: one(games, {
    fields: [activities.gameId],
    references: [games.id],
  }),
  targetUser: one(users, {
    fields: [activities.targetUserId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertLicenseSchema = createInsertSchema(licenses).omit({
  id: true,
  createdAt: true,
  usedAt: true,
  usedBy: true,
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true,
});

export const insertDownloadSchema = createInsertSchema(downloads).omit({
  id: true,
  downloadedAt: true,
});

export const insertUserLibrarySchema = createInsertSchema(userLibrary).omit({
  id: true,
  addedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWishlistSchema = createInsertSchema(wishlist).omit({
  id: true,
  addedAt: true,
});

export const insertFollowSchema = createInsertSchema(follows).omit({
  id: true,
  createdAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  unlockedAt: true,
});

export const insertPlaytimeSchema = createInsertSchema(playtime).omit({
  id: true,
  updatedAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScreenshotSchema = createInsertSchema(screenshots).omit({
  id: true,
  createdAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type License = typeof licenses.$inferSelect;
export type InsertLicense = z.infer<typeof insertLicenseSchema>;

export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;

export type Download = typeof downloads.$inferSelect;
export type InsertDownload = z.infer<typeof insertDownloadSchema>;

export type UserLibrary = typeof userLibrary.$inferSelect;
export type InsertUserLibrary = z.infer<typeof insertUserLibrarySchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Wishlist = typeof wishlist.$inferSelect;
export type InsertWishlist = z.infer<typeof insertWishlistSchema>;

export type Follow = typeof follows.$inferSelect;
export type InsertFollow = z.infer<typeof insertFollowSchema>;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

export type Playtime = typeof playtime.$inferSelect;
export type InsertPlaytime = z.infer<typeof insertPlaytimeSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Screenshot = typeof screenshots.$inferSelect;
export type InsertScreenshot = z.infer<typeof insertScreenshotSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
