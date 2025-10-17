import { db } from "./db";
import {
  type User,
  type InsertUser,
  type Game,
  type InsertGame,
  type SupportTicket,
  type InsertSupportTicket,
  type GameRequest,
  type InsertGameRequest,
  type Favorite,
  type InsertFavorite,
  type Review,
  type InsertReview,
  type RecentlyViewed,
  type InsertRecentlyViewed,
  type DownloadHistory,
  type InsertDownloadHistory,
  users,
  games,
  supportTickets,
  gameRequests,
  favorites,
  reviews,
  recentlyViewed,
  downloadHistory,
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  getGame(id: string): Promise<Game | undefined>;
  getAllGames(): Promise<Game[]>;
  createGame(game: InsertGame): Promise<Game>;
  updateGame(id: string, game: Partial<InsertGame>): Promise<Game | undefined>;
  deleteGame(id: string): Promise<void>;
  incrementDownloads(id: string): Promise<void>;
  
  getSupportTicket(id: string): Promise<SupportTicket | undefined>;
  getAllSupportTickets(): Promise<SupportTicket[]>;
  getSupportTicketsByStatus(status: string): Promise<SupportTicket[]>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicketStatus(id: string, status: string): Promise<void>;
  
  getGameRequest(id: string): Promise<GameRequest | undefined>;
  getAllGameRequests(): Promise<GameRequest[]>;
  getGameRequestsByStatus(status: string): Promise<GameRequest[]>;
  createGameRequest(request: InsertGameRequest): Promise<GameRequest>;
  updateGameRequestStatus(id: string, status: string): Promise<void>;
  
  addFavorite(userId: string, gameId: string): Promise<Favorite>;
  removeFavorite(userId: string, gameId: string): Promise<void>;
  getUserFavorites(userId: string): Promise<Game[]>;
  isFavorite(userId: string, gameId: string): Promise<boolean>;
  
  addReview(review: InsertReview): Promise<Review>;
  getGameReviews(gameId: string): Promise<Review[]>;
  getUserReview(userId: string, gameId: string): Promise<Review | undefined>;
  updateReview(id: string, rating: number, comment?: string): Promise<void>;
  deleteReview(id: string): Promise<void>;
  
  addRecentlyViewed(userId: string, gameId: string): Promise<void>;
  getUserRecentlyViewed(userId: string, limit?: number): Promise<Game[]>;
  
  addDownloadHistory(userId: string, gameId: string): Promise<void>;
  getUserDownloadHistory(userId: string): Promise<Game[]>;
  
  getPopularGames(limit?: number): Promise<Game[]>;
  getTrendingGames(limit?: number): Promise<Game[]>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getGame(id: string): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game;
  }

  async getAllGames(): Promise<Game[]> {
    return await db.select().from(games);
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const [game] = await db.insert(games).values(insertGame).returning();
    return game;
  }

  async updateGame(id: string, gameData: Partial<InsertGame>): Promise<Game | undefined> {
    const [game] = await db.update(games).set(gameData).where(eq(games.id, id)).returning();
    return game;
  }

  async deleteGame(id: string): Promise<void> {
    await db.delete(games).where(eq(games.id, id));
  }

  async incrementDownloads(id: string): Promise<void> {
    const game = await this.getGame(id);
    if (game) {
      await db.update(games).set({ downloads: (game.downloads || 0) + 1 }).where(eq(games.id, id));
    }
  }

  async getSupportTicket(id: string): Promise<SupportTicket | undefined> {
    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, id));
    return ticket;
  }

  async getAllSupportTickets(): Promise<SupportTicket[]> {
    return await db.select().from(supportTickets);
  }

  async getSupportTicketsByStatus(status: string): Promise<SupportTicket[]> {
    return await db.select().from(supportTickets).where(eq(supportTickets.status, status));
  }

  async createSupportTicket(insertTicket: InsertSupportTicket): Promise<SupportTicket> {
    const [ticket] = await db.insert(supportTickets).values(insertTicket).returning();
    return ticket;
  }

  async updateSupportTicketStatus(id: string, status: string): Promise<void> {
    await db.update(supportTickets).set({ status, updatedAt: new Date() }).where(eq(supportTickets.id, id));
  }

  async getGameRequest(id: string): Promise<GameRequest | undefined> {
    const [request] = await db.select().from(gameRequests).where(eq(gameRequests.id, id));
    return request;
  }

  async getAllGameRequests(): Promise<GameRequest[]> {
    return await db.select().from(gameRequests);
  }

  async getGameRequestsByStatus(status: string): Promise<GameRequest[]> {
    return await db.select().from(gameRequests).where(eq(gameRequests.status, status));
  }

  async createGameRequest(insertRequest: InsertGameRequest): Promise<GameRequest> {
    const [request] = await db.insert(gameRequests).values(insertRequest).returning();
    return request;
  }

  async updateGameRequestStatus(id: string, status: string): Promise<void> {
    await db.update(gameRequests).set({ status, updatedAt: new Date() }).where(eq(gameRequests.id, id));
  }

  async addFavorite(userId: string, gameId: string): Promise<Favorite> {
    const [favorite] = await db.insert(favorites).values({ userId, gameId }).returning();
    return favorite;
  }

  async removeFavorite(userId: string, gameId: string): Promise<void> {
    await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.gameId, gameId)));
  }

  async getUserFavorites(userId: string): Promise<Game[]> {
    const userFavorites = await db
      .select({ game: games })
      .from(favorites)
      .innerJoin(games, eq(favorites.gameId, games.id))
      .where(eq(favorites.userId, userId));
    return userFavorites.map(f => f.game);
  }

  async isFavorite(userId: string, gameId: string): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.gameId, gameId)));
    return !!favorite;
  }

  async addReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    
    const gameReviews = await db.select().from(reviews).where(eq(reviews.gameId, review.gameId));
    const avgRating = Math.round(gameReviews.reduce((acc, r) => acc + r.rating, 0) / gameReviews.length);
    
    await db.update(games).set({
      averageRating: avgRating,
      totalRatings: gameReviews.length
    }).where(eq(games.id, review.gameId));
    
    return newReview;
  }

  async getGameReviews(gameId: string): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.gameId, gameId)).orderBy(desc(reviews.createdAt));
  }

  async getUserReview(userId: string, gameId: string): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.userId, userId), eq(reviews.gameId, gameId)));
    return review;
  }

  async updateReview(id: string, rating: number, comment?: string): Promise<void> {
    const updateData: any = { rating, updatedAt: new Date() };
    if (comment !== undefined) updateData.comment = comment;
    await db.update(reviews).set(updateData).where(eq(reviews.id, id));
  }

  async deleteReview(id: string): Promise<void> {
    await db.delete(reviews).where(eq(reviews.id, id));
  }

  async addRecentlyViewed(userId: string, gameId: string): Promise<void> {
    const existing = await db
      .select()
      .from(recentlyViewed)
      .where(and(eq(recentlyViewed.userId, userId), eq(recentlyViewed.gameId, gameId)));
    
    if (existing.length > 0) {
      await db
        .update(recentlyViewed)
        .set({ viewedAt: new Date() })
        .where(and(eq(recentlyViewed.userId, userId), eq(recentlyViewed.gameId, gameId)));
    } else {
      await db.insert(recentlyViewed).values({ userId, gameId });
    }
  }

  async getUserRecentlyViewed(userId: string, limit: number = 10): Promise<Game[]> {
    const viewed = await db
      .select({ game: games })
      .from(recentlyViewed)
      .innerJoin(games, eq(recentlyViewed.gameId, games.id))
      .where(eq(recentlyViewed.userId, userId))
      .orderBy(desc(recentlyViewed.viewedAt))
      .limit(limit);
    return viewed.map(v => v.game);
  }

  async addDownloadHistory(userId: string, gameId: string): Promise<void> {
    await db.insert(downloadHistory).values({ userId, gameId });
  }

  async getUserDownloadHistory(userId: string): Promise<Game[]> {
    const history = await db
      .select({ game: games })
      .from(downloadHistory)
      .innerJoin(games, eq(downloadHistory.gameId, games.id))
      .where(eq(downloadHistory.userId, userId))
      .orderBy(desc(downloadHistory.downloadedAt));
    return history.map(h => h.game);
  }

  async getPopularGames(limit: number = 10): Promise<Game[]> {
    return await db
      .select()
      .from(games)
      .orderBy(desc(games.downloads))
      .limit(limit);
  }

  async getTrendingGames(limit: number = 10): Promise<Game[]> {
    // Only show games with at least 5 downloads and a rating above 60 as trending
    const allGames = await db
      .select()
      .from(games)
      .orderBy(desc(games.downloads), desc(games.averageRating));
    
    return allGames
      .filter(game => (game.downloads || 0) >= 5 && (game.averageRating || 0) >= 60)
      .slice(0, limit);
  }
}

export const storage = new DbStorage();
