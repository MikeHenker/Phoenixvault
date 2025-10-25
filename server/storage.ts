import {
  users,
  licenses,
  games,
  downloads,
  type User,
  type InsertUser,
  type License,
  type InsertLicense,
  type Game,
  type InsertGame,
  type Download,
  type InsertDownload,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
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

  // Stats
  getStats(): Promise<{
    totalUsers: number;
    totalLicenses: number;
    activeLicenses: number;
    totalGames: number;
    totalDownloads: number;
  }>;
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
}

export const storage = new DatabaseStorage();
