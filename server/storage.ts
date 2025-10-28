import {
  users,
  licenses,
  games,
  downloads,
  userLibrary,
  reviews,
  wishlist,
  screenshots,
  activities,
  follows,
  achievements,
  userAchievements,
  playtime,
  comments,
  type User,
  type InsertUser,
  type License,
  type InsertLicense,
  type Game,
  type InsertGame,
  type Download,
  type InsertDownload,
  type UserLibrary,
  type InsertUserLibrary,
  type Review,
  type InsertReview,
  type Wishlist,
  type InsertWishlist,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Licenses
  getLicense(key: string): Promise<License | undefined>;
  getLicenseById(id: string): Promise<License | undefined>;
  createLicense(license: InsertLicense): Promise<License>;
  getAllLicenses(): Promise<License[]>;
  updateLicense(id: string, data: Partial<License>): Promise<License>;

  // Games
  getGame(id: string): Promise<Game | undefined>;
  getAllGames(): Promise<Game[]>;
  createGame(game: InsertGame): Promise<Game>;
  updateGame(id: string, data: Partial<InsertGame>): Promise<Game>;
  deleteGame(id: string): Promise<void>;

  // Downloads
  createDownload(download: InsertDownload): Promise<Download>;
  getDownloadsByUser(userId: string): Promise<Download[]>;
  getTotalDownloads(): Promise<number>;

  // User Library
  addToLibrary(data: InsertUserLibrary): Promise<UserLibrary>;
  removeFromLibrary(userId: string, gameId: string): Promise<void>;
  updateLibraryEntry(userId: string, gameId: string, data: { hasLocalFiles?: boolean; exePath?: string }): Promise<UserLibrary>;
  getUserLibrary(userId: string): Promise<UserLibrary[]>;
  getLibraryEntry(userId: string, gameId: string): Promise<UserLibrary | undefined>;
  isInLibrary(userId: string, gameId: string): Promise<boolean>;

  // Reviews and Ratings
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: string, data: Partial<InsertReview>): Promise<Review>;
  deleteReview(id: string): Promise<void>;
  getGameReviews(gameId: string): Promise<Review[]>;
  getUserReview(userId: string, gameId: string): Promise<Review | undefined>;
  updateGameRating(gameId: string): Promise<void>;

  // Wishlist
  addToWishlist(data: InsertWishlist): Promise<Wishlist>;
  removeFromWishlist(userId: string, gameId: string): Promise<void>;
  getUserWishlist(userId: string): Promise<Wishlist[]>;
  isInWishlist(userId: string, gameId: string): Promise<boolean>;

  // Bulk operations
  bulkDeleteGames(gameIds: string[]): Promise<void>;
  bulkToggleGameActive(gameIds: string[], isActive: boolean): Promise<void>;

  // Screenshots
  createScreenshot(data: any): Promise<any>;
  getGameScreenshots(gameId: string): Promise<any[]>;
  deleteScreenshot(id: string, userId: string): Promise<void>;

  // Stats
  getStats(): Promise<{
    totalUsers: number;
    totalLicenses: number;
    activeLicenses: number;
    totalGames: number;
    totalDownloads: number;
  }>;
  getDownloadStats(): Promise<Array<{ gameId: string; gameTitle: string; downloads: number }>>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Licenses
  async getLicense(key: string): Promise<License | undefined> {
    const [license] = await db.select().from(licenses).where(eq(licenses.key, key));
    return license || undefined;
  }

  async getLicenseById(id: string): Promise<License | undefined> {
    const [license] = await db.select().from(licenses).where(eq(licenses.id, id));
    return license || undefined;
  }

  async createLicense(insertLicense: InsertLicense): Promise<License> {
    const [license] = await db.insert(licenses).values(insertLicense).returning();
    return license;
  }

  async getAllLicenses(): Promise<License[]> {
    return await db.select().from(licenses).orderBy(desc(licenses.createdAt));
  }

  async updateLicense(id: string, data: Partial<License>): Promise<License> {
    const [license] = await db
      .update(licenses)
      .set(data)
      .where(eq(licenses.id, id))
      .returning();
    return license;
  }

  // Games
  async getGame(id: string): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game || undefined;
  }

  async getAllGames(): Promise<Game[]> {
    return await db.select().from(games).orderBy(desc(games.createdAt));
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const [game] = await db.insert(games).values(insertGame).returning();
    return game;
  }

  async updateGame(id: string, data: Partial<InsertGame>): Promise<Game> {
    const [game] = await db
      .update(games)
      .set(data)
      .where(eq(games.id, id))
      .returning();
    return game;
  }

  async deleteGame(id: string): Promise<void> {
    // First delete all downloads associated with this game
    await db.delete(downloads).where(eq(downloads.gameId, id));
    // Then delete the game
    await db.delete(games).where(eq(games.id, id));
  }

  // Downloads
  async createDownload(insertDownload: InsertDownload): Promise<Download> {
    const [download] = await db.insert(downloads).values(insertDownload).returning();
    return download;
  }

  async getDownloadsByUser(userId: string): Promise<Download[]> {
    return await db.select().from(downloads).where(eq(downloads.userId, userId));
  }

  async getGameStats(): Promise<Record<string, { downloads: number; inLibrary: number }>> {
    const allGames = await this.getGames();
    const stats: Record<string, { downloads: number; inLibrary: number }> = {};

    for (const game of allGames) {
      const [downloadCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(downloads)
        .where(eq(downloads.gameId, game.id));

      const [libraryCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(userLibrary)
        .where(eq(userLibrary.gameId, game.id));

      stats[game.id] = {
        downloads: Number(downloadCount.count) || 0,
        inLibrary: Number(libraryCount.count) || 0,
      };
    }

    return stats;
  }

  async getTotalDownloads(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(downloads);
    return Number(result[0].count);
  }

  // User Library
  async addToLibrary(data: InsertUserLibrary): Promise<UserLibrary> {
    const [library] = await db.insert(userLibrary).values(data).returning();
    return library;
  }

  async removeFromLibrary(userId: string, gameId: string): Promise<void> {
    await db
      .delete(userLibrary)
      .where(
        and(
          eq(userLibrary.userId, userId),
          eq(userLibrary.gameId, gameId)
        )
      );
  }

  async updateLibraryEntry(userId: string, gameId: string, data: { hasLocalFiles?: boolean; exePath?: string }): Promise<UserLibrary> {
    const [entry] = await db
      .update(userLibrary)
      .set(data)
      .where(
        and(
          eq(userLibrary.userId, userId),
          eq(userLibrary.gameId, gameId)
        )
      )
      .returning();
    return entry;
  }

  async getUserLibrary(userId: string): Promise<UserLibrary[]> {
    return await db.select().from(userLibrary).where(eq(userLibrary.userId, userId));
  }

  async getLibraryEntry(userId: string, gameId: string): Promise<UserLibrary | undefined> {
    const [entry] = await db
      .select()
      .from(userLibrary)
      .where(
        and(
          eq(userLibrary.userId, userId),
          eq(userLibrary.gameId, gameId)
        )
      );
    return entry || undefined;
  }

  async isInLibrary(userId: string, gameId: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(userLibrary)
      .where(sql`${userLibrary.userId} = ${userId} AND ${userLibrary.gameId} = ${gameId}`);
    return !!result;
  }

  // Reviews and Ratings
  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    await this.updateGameRating(insertReview.gameId);
    return review;
  }

  async updateReview(id: string, data: Partial<InsertReview>): Promise<Review> {
    const [review] = await db
      .update(reviews)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(reviews.id, id))
      .returning();
    if (review) {
      await this.updateGameRating(review.gameId);
    }
    return review;
  }

  async deleteReview(id: string): Promise<void> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    if (review) {
      await db.delete(reviews).where(eq(reviews.id, id));
      await this.updateGameRating(review.gameId);
    }
  }

  async getGameReviews(gameId: string): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.gameId, gameId)).orderBy(desc(reviews.createdAt));
  }

  async getUserReview(userId: string, gameId: string): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(sql`${reviews.userId} = ${userId} AND ${reviews.gameId} = ${gameId}`);
    return review || undefined;
  }

  async updateGameRating(gameId: string): Promise<void> {
    const gameReviews = await db.select().from(reviews).where(eq(reviews.gameId, gameId));

    if (gameReviews.length === 0) {
      await db
        .update(games)
        .set({ averageRating: 0, totalRatings: 0 })
        .where(eq(games.id, gameId));
      return;
    }

    const totalRating = gameReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = Math.round(totalRating / gameReviews.length);

    await db
      .update(games)
      .set({
        averageRating,
        totalRatings: gameReviews.length,
      })
      .where(eq(games.id, gameId));
  }

  // Wishlist
  async addToWishlist(data: InsertWishlist): Promise<Wishlist> {
    const [item] = await db.insert(wishlist).values(data).returning();
    return item;
  }

  async removeFromWishlist(userId: string, gameId: string): Promise<void> {
    await db
      .delete(wishlist)
      .where(sql`${wishlist.userId} = ${userId} AND ${wishlist.gameId} = ${gameId}`);
  }

  async getUserWishlist(userId: string): Promise<Wishlist[]> {
    return await db.select().from(wishlist).where(eq(wishlist.userId, userId));
  }

  async isInWishlist(userId: string, gameId: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(wishlist)
      .where(sql`${wishlist.userId} = ${userId} AND ${wishlist.gameId} = ${gameId}`);
    return !!result;
  }

  // Bulk operations
  async bulkDeleteGames(gameIds: string[]): Promise<void> {
    for (const gameId of gameIds) {
      await this.deleteGame(gameId);
    }
  }

  async bulkToggleGameActive(gameIds: string[], isActive: boolean): Promise<void> {
    for (const gameId of gameIds) {
      await db.update(games).set({ isActive }).where(eq(games.id, gameId));
    }
  }

  // Screenshots
  async createScreenshot(data: any): Promise<any> {
    const { screenshots } = await import("@shared/schema");
    const [screenshot] = await db.insert(screenshots).values(data).returning();
    return screenshot;
  }

  async getGameScreenshots(gameId: string): Promise<any[]> {
    const { screenshots } = await import("@shared/schema");
    return await db.select().from(screenshots).where(eq(screenshots.gameId, gameId));
  }

  async deleteScreenshot(id: string, userId: string): Promise<void> {
    const { screenshots } = await import("@shared/schema");
    await db.delete(screenshots).where(
      and(
        eq(screenshots.id, id),
        eq(screenshots.userId, userId)
      )
    );
  }

  // Stats
  async getStats(): Promise<{
    totalUsers: number;
    totalLicenses: number;
    activeLicenses: number;
    totalGames: number;
    totalDownloads: number;
  }> {
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [licenseCount] = await db.select({ count: sql<number>`count(*)` }).from(licenses);
    const [activeLicenseCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(licenses)
      .where(eq(licenses.isActive, true));
    const [gameCount] = await db.select({ count: sql<number>`count(*)` }).from(games);
    const [downloadCount] = await db.select({ count: sql<number>`count(*)` }).from(downloads);

    return {
      totalUsers: Number(userCount.count),
      totalLicenses: Number(licenseCount.count),
      activeLicenses: Number(activeLicenseCount.count),
      totalGames: Number(gameCount.count),
      totalDownloads: Number(downloadCount.count),
    };
  }

  async getDownloadStats(): Promise<Array<{ gameId: string; gameTitle: string; downloads: number }>> {
    const result = await db
      .select({
        gameId: downloads.gameId,
        count: sql<number>`count(*)`,
      })
      .from(downloads)
      .groupBy(downloads.gameId);

    const stats = await Promise.all(
      result.map(async (item) => {
        const game = await this.getGame(item.gameId);
        return {
          gameId: item.gameId,
          gameTitle: game?.title || "Unknown",
          downloads: Number(item.count),
        };
      })
    );

    return stats.sort((a, b) => b.downloads - a.downloads);
  }

  // Screenshots
  async createScreenshot(data: any): Promise<any> {
    const [screenshot] = await db.insert(screenshots).values(data).returning();
    return screenshot;
  }

  async getGameScreenshots(gameId: string): Promise<any[]> {
    return await db.select().from(screenshots).where(eq(screenshots.gameId, gameId));
  }

  async deleteScreenshot(id: string, userId: string): Promise<void> {
    await db.delete(screenshots).where(and(eq(screenshots.id, id), eq(screenshots.userId, userId)));
  }

  // Activities
  async createActivity(data: any): Promise<any> {
    const [activity] = await db.insert(activities).values(data).returning();
    return activity;
  }

  async getActivityFeed(userId: string): Promise<any[]> {
    return await db.select().from(activities).where(eq(activities.userId, userId)).orderBy(desc(activities.createdAt));
  }

  async getUserActivity(userId: string): Promise<any[]> {
    return await db.select().from(activities).where(eq(activities.userId, userId)).orderBy(desc(activities.createdAt));
  }

  // User Stats and Profile
  async getUserStats(userId: string): Promise<any> {
    const libraryCount = await db.select({ count: sql<number>`count(*)` }).from(userLibrary).where(eq(userLibrary.userId, userId));
    const reviewCount = await db.select({ count: sql<number>`count(*)` }).from(reviews).where(eq(reviews.userId, userId));
    const followerCount = await db.select({ count: sql<number>`count(*)` }).from(follows).where(eq(follows.followingId, userId));
    const followingCount = await db.select({ count: sql<number>`count(*)` }).from(follows).where(eq(follows.followerId, userId));

    return {
      gamesOwned: Number(libraryCount[0].count),
      reviewsWritten: Number(reviewCount[0].count),
      followers: Number(followerCount[0].count),
      following: Number(followingCount[0].count),
    };
  }

  async updateUserProfile(userId: string, data: { avatarUrl?: string; bio?: string; location?: string }): Promise<User> {
    return await this.updateUser(userId, data);
  }

  // Followers
  async getFollowers(userId: string): Promise<any[]> {
    return await db.select().from(follows).where(eq(follows.followingId, userId));
  }

  async getFollowing(userId: string): Promise<any[]> {
    return await db.select().from(follows).where(eq(follows.followerId, userId));
  }

  async followUser(followerId: string, followingId: string): Promise<any> {
    const [follow] = await db.insert(follows).values({ followerId, followingId }).returning();
    return follow;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    await db.delete(follows).where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const [result] = await db.select().from(follows).where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
    return !!result;
  }

  // Achievements
  async getGameAchievements(gameId: string): Promise<any[]> {
    return await db.select().from(achievements).where(eq(achievements.gameId, gameId));
  }

  async getUserAchievements(userId: string): Promise<any[]> {
    return await db.select().from(userAchievements).where(eq(userAchievements.userId, userId));
  }

  async getAchievement(id: string): Promise<any> {
    const [achievement] = await db.select().from(achievements).where(eq(achievements.id, id));
    return achievement;
  }

  async unlockAchievement(userId: string, achievementId: string): Promise<any> {
    const [unlocked] = await db.insert(userAchievements).values({ userId, achievementId }).returning();
    return unlocked;
  }

  // Playtime
  async getUserPlaytime(userId: string): Promise<any[]> {
    return await db.select().from(playtime).where(eq(playtime.userId, userId));
  }

  async updatePlaytime(userId: string, gameId: string, minutes: number): Promise<any> {
    const existing = await db.select().from(playtime).where(and(eq(playtime.userId, userId), eq(playtime.gameId, gameId)));
    
    if (existing.length > 0) {
      const [updated] = await db.update(playtime)
        .set({ totalMinutes: existing[0].totalMinutes + minutes, lastPlayed: new Date(), updatedAt: new Date() })
        .where(and(eq(playtime.userId, userId), eq(playtime.gameId, gameId)))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(playtime).values({ userId, gameId, totalMinutes: minutes, lastPlayed: new Date() }).returning();
      return created;
    }
  }

  // Comments
  async getGameComments(gameId: string): Promise<any[]> {
    return await db.select().from(comments).where(eq(comments.gameId, gameId)).orderBy(desc(comments.createdAt));
  }

  async createComment(data: any): Promise<any> {
    const [comment] = await db.insert(comments).values(data).returning();
    return comment;
  }

  async updateComment(id: string, userId: string, content: string): Promise<any> {
    const [comment] = await db.update(comments)
      .set({ content, updatedAt: new Date() })
      .where(and(eq(comments.id, id), eq(comments.userId, userId)))
      .returning();
    return comment;
  }

  async deleteComment(id: string, userId: string): Promise<void> {
    await db.delete(comments).where(and(eq(comments.id, id), eq(comments.userId, userId)));
  }

  // Trending and Popular
  async getTrendingGames(): Promise<Game[]> {
    return await db.select().from(games).orderBy(desc(games.createdAt)).limit(10);
  }

  async getPopularGames(): Promise<Game[]> {
    return await db.select().from(games).orderBy(desc(games.totalRatings)).limit(10);
  }

  async getRecommendations(userId: string): Promise<Game[]> {
    return await db.select().from(games).orderBy(desc(games.averageRating)).limit(10);
  }
}

export const storage = new DatabaseStorage();