import {
  users,
  licenses,
  games,
  downloads,
  userLibrary,
  reviews,
  wishlist,
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
import { eq, desc, sql } from "drizzle-orm";

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
  getUserLibrary(userId: string): Promise<UserLibrary[]>;
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
      .where(sql`${userLibrary.userId} = ${userId} AND ${userLibrary.gameId} = ${gameId}`);
  }

  async getUserLibrary(userId: string): Promise<UserLibrary[]> {
    return await db.select().from(userLibrary).where(eq(userLibrary.userId, userId));
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
}

export const storage = new DatabaseStorage();
