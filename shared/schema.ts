import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const games = pgTable("games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  trailerUrl: text("trailer_url"),
  screenshots: text("screenshots").array().default(sql`ARRAY[]::text[]`),
  downloadLinks: text("download_links").array().notNull(),
  category: text("category").notNull(),
  platform: text("platform").notNull(),
  fileSize: text("file_size").notNull(),
  releaseDate: text("release_date").notNull(),
  ageRating: text("age_rating").default("everyone"),
  contentTags: text("content_tags").array().default(sql`ARRAY[]::text[]`),
  downloads: integer("downloads").default(0),
  averageRating: integer("average_rating").default(0),
  totalRatings: integer("total_ratings").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const supportTickets = pgTable("support_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("open"),
  priority: text("priority").notNull().default("medium"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const gameRequests = pgTable("game_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameTitle: text("game_title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameId: varchar("game_id").notNull().references(() => games.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameId: varchar("game_id").notNull().references(() => games.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const recentlyViewed = pgTable("recently_viewed", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameId: varchar("game_id").notNull().references(() => games.id),
  viewedAt: timestamp("viewed_at").defaultNow(),
});

export const downloadHistory = pgTable("download_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameId: varchar("game_id").notNull().references(() => games.id),
  downloadedAt: timestamp("downloaded_at").defaultNow(),
});

export const wishlists = pgTable("wishlists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameId: varchar("game_id").notNull().references(() => games.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: integer("is_read").default(0),
  relatedGameId: varchar("related_game_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  achievementType: text("achievement_type").notNull(),
  achievementName: text("achievement_name").notNull(),
  description: text("description").notNull(),
  iconName: text("icon_name").notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
});

export const gameBundles = pgTable("game_bundles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  gameIds: text("game_ids").array().notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gameVersions = pgTable("game_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull().references(() => games.id),
  version: text("version").notNull(),
  updateNotes: text("update_notes").notNull(),
  releaseDate: timestamp("release_date").defaultNow(),
});

export const activityFeed = pgTable("activity_feed", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  activityType: text("activity_type").notNull(),
  description: text("description").notNull(),
  relatedGameId: varchar("related_game_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userFollows = pgTable("user_follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  followerId: varchar("follower_id").notNull().references(() => users.id),
  followingId: varchar("following_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviewVotes = pgTable("review_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  reviewId: varchar("review_id").notNull().references(() => reviews.id),
  voteType: text("vote_type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  userId: varchar("user_id").references(() => users.id),
  isActive: integer("is_active").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gamePreorders = pgTable("game_preorders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull().references(() => games.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  preorderDate: timestamp("preorder_date").defaultNow(),
  expectedReleaseDate: text("expected_release_date").notNull(),
});

export const discussionBoards = pgTable("discussion_boards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull().references(() => games.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const streamingLinks = pgTable("streaming_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull().references(() => games.id),
  platform: text("platform").notNull(),
  streamUrl: text("stream_url").notNull(),
  streamerName: text("streamer_name").notNull(),
  isLive: integer("is_live").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  bannerUrl: text("banner_url"),
  socialLinks: text("social_links").array().default(sql`ARRAY[]::text[]`),
  favoriteGenres: text("favorite_genres").array().default(sql`ARRAY[]::text[]`),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const gameGifts = pgTable("game_gifts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull().references(() => games.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  recipientId: varchar("recipient_id").notNull().references(() => users.id),
  message: text("message"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const playtimeTracking = pgTable("playtime_tracking", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameId: varchar("game_id").notNull().references(() => games.id),
  totalMinutes: integer("total_minutes").default(0),
  lastPlayed: timestamp("last_played").defaultNow(),
  firstPlayed: timestamp("first_played").defaultNow(),
});

export const gameTags = pgTable("game_tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull().references(() => games.id),
  tag: text("tag").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  downloads: true,
  createdAt: true,
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGameRequestSchema = createInsertSchema(gameRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRecentlyViewedSchema = createInsertSchema(recentlyViewed).omit({
  id: true,
  viewedAt: true,
});

export const insertDownloadHistorySchema = createInsertSchema(downloadHistory).omit({
  id: true,
  downloadedAt: true,
});

export const insertWishlistSchema = createInsertSchema(wishlists).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  earnedAt: true,
});

export const insertGameBundleSchema = createInsertSchema(gameBundles).omit({
  id: true,
  createdAt: true,
});

export const insertGameVersionSchema = createInsertSchema(gameVersions).omit({
  id: true,
  releaseDate: true,
});

export const insertActivityFeedSchema = createInsertSchema(activityFeed).omit({
  id: true,
  createdAt: true,
});

export const insertUserFollowSchema = createInsertSchema(userFollows).omit({
  id: true,
  createdAt: true,
});

export const insertReviewVoteSchema = createInsertSchema(reviewVotes).omit({
  id: true,
  createdAt: true,
});

export const insertNewsletterSubscriptionSchema = createInsertSchema(newsletterSubscriptions).omit({
  id: true,
  createdAt: true,
});

export const insertGamePreorderSchema = createInsertSchema(gamePreorders).omit({
  id: true,
  preorderDate: true,
});

export const insertDiscussionBoardSchema = createInsertSchema(discussionBoards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStreamingLinkSchema = createInsertSchema(streamingLinks).omit({
  id: true,
  createdAt: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  updatedAt: true,
});

export const insertGameGiftSchema = createInsertSchema(gameGifts).omit({
  id: true,
  createdAt: true,
});

export const insertPlaytimeTrackingSchema = createInsertSchema(playtimeTracking).omit({
  id: true,
  lastPlayed: true,
  firstPlayed: true,
});

export const insertGameTagSchema = createInsertSchema(gameTags).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;

export type InsertGameRequest = z.infer<typeof insertGameRequestSchema>;
export type GameRequest = typeof gameRequests.$inferSelect;

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type InsertRecentlyViewed = z.infer<typeof insertRecentlyViewedSchema>;
export type RecentlyViewed = typeof recentlyViewed.$inferSelect;

export type InsertDownloadHistory = z.infer<typeof insertDownloadHistorySchema>;
export type DownloadHistory = typeof downloadHistory.$inferSelect;

export type InsertWishlist = z.infer<typeof insertWishlistSchema>;
export type Wishlist = typeof wishlists.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;

export type InsertGameBundle = z.infer<typeof insertGameBundleSchema>;
export type GameBundle = typeof gameBundles.$inferSelect;

export type InsertGameVersion = z.infer<typeof insertGameVersionSchema>;
export type GameVersion = typeof gameVersions.$inferSelect;

export type InsertActivityFeed = z.infer<typeof insertActivityFeedSchema>;
export type ActivityFeed = typeof activityFeed.$inferSelect;

export type InsertUserFollow = z.infer<typeof insertUserFollowSchema>;
export type UserFollow = typeof userFollows.$inferSelect;

export type InsertReviewVote = z.infer<typeof insertReviewVoteSchema>;
export type ReviewVote = typeof reviewVotes.$inferSelect;

export type InsertNewsletterSubscription = z.infer<typeof insertNewsletterSubscriptionSchema>;
export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;

export type InsertGamePreorder = z.infer<typeof insertGamePreorderSchema>;
export type GamePreorder = typeof gamePreorders.$inferSelect;

export type InsertDiscussionBoard = z.infer<typeof insertDiscussionBoardSchema>;
export type DiscussionBoard = typeof discussionBoards.$inferSelect;

export type InsertStreamingLink = z.infer<typeof insertStreamingLinkSchema>;
export type StreamingLink = typeof streamingLinks.$inferSelect;

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;

export type InsertGameGift = z.infer<typeof insertGameGiftSchema>;
export type GameGift = typeof gameGifts.$inferSelect;

export type InsertPlaytimeTracking = z.infer<typeof insertPlaytimeTrackingSchema>;
export type PlaytimeTracking = typeof playtimeTracking.$inferSelect;

export type InsertGameTag = z.infer<typeof insertGameTagSchema>;
export type GameTag = typeof gameTags.$inferSelect;
