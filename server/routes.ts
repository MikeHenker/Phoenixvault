import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertGameSchema, insertSupportTicketSchema, insertGameRequestSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.SESSION_SECRET || "phoenix-games-secret-key";

interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
}

async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.userRole !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
        role: "user",
      });

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/games", async (req, res) => {
    try {
      const games = await storage.getAllGames();
      res.json(games);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/games/:id", async (req, res) => {
    try {
      const game = await storage.getGame(req.params.id);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(game);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/games", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const data = insertGameSchema.parse(req.body);
      const game = await storage.createGame(data);
      res.json(game);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/games/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const game = await storage.updateGame(req.params.id, req.body);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(game);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/games/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      await storage.deleteGame(req.params.id);
      res.json({ message: "Game deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/games/:id/download", authenticateToken, async (req: AuthRequest, res) => {
    try {
      await storage.incrementDownloads(req.params.id);
      await storage.addDownloadHistory(req.userId!, req.params.id);
      const game = await storage.getGame(req.params.id);
      res.json(game);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/games/:id/view", authenticateToken, async (req: AuthRequest, res) => {
    try {
      await storage.addRecentlyViewed(req.userId!, req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/games/popular/list", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const games = await storage.getPopularGames(limit);
      res.json(games);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/games/trending/list", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const games = await storage.getTrendingGames(limit);
      res.json(games);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/favorites", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { gameId } = req.body;
      const favorite = await storage.addFavorite(req.userId!, gameId);
      res.json(favorite);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/favorites/:gameId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      await storage.removeFavorite(req.userId!, req.params.gameId);
      res.json({ message: "Favorite removed" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/favorites", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const favorites = await storage.getUserFavorites(req.userId!);
      res.json(favorites);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/favorites/check/:gameId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const isFav = await storage.isFavorite(req.userId!, req.params.gameId);
      res.json({ isFavorite: isFav });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/reviews", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { gameId, rating, comment } = req.body;
      const review = await storage.addReview({
        userId: req.userId!,
        gameId,
        rating,
        comment,
      });
      res.json(review);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/reviews/:gameId", async (req, res) => {
    try {
      const reviews = await storage.getGameReviews(req.params.gameId);
      res.json(reviews);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/user/recently-viewed", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const games = await storage.getUserRecentlyViewed(req.userId!);
      res.json(games);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/user/download-history", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const games = await storage.getUserDownloadHistory(req.userId!);
      res.json(games);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/support", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const tickets = req.userRole === "admin"
        ? await storage.getAllSupportTickets()
        : await storage.getAllSupportTickets(); // Filter by user in production
      res.json(tickets);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/support", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const data = insertSupportTicketSchema.parse({
        ...req.body,
        userId: req.userId,
      });
      const ticket = await storage.createSupportTicket(data);
      res.json(ticket);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/support/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      await storage.updateSupportTicketStatus(req.params.id, req.body.status);
      const ticket = await storage.getSupportTicket(req.params.id);
      res.json(ticket);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/requests", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const requests = req.userRole === "admin"
        ? await storage.getAllGameRequests()
        : await storage.getAllGameRequests(); // Filter by user in production
      res.json(requests);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/requests", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const data = insertGameRequestSchema.parse({
        ...req.body,
        userId: req.userId,
      });
      const request = await storage.createGameRequest(data);
      res.json(request);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/requests/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      await storage.updateGameRequestStatus(req.params.id, req.body.status);
      const request = await storage.getGameRequest(req.params.id);
      res.json(request);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const users = await storage.getAllUsers();
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/stats", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const [games, users, tickets, requests] = await Promise.all([
        storage.getAllGames(),
        storage.getAllUsers(),
        storage.getAllSupportTickets(),
        storage.getAllGameRequests(),
      ]);

      const stats = {
        totalGames: games.length,
        totalUsers: users.length,
        openTickets: tickets.filter(t => t.status === "open").length,
        pendingRequests: requests.filter(r => r.status === "pending").length,
      };

      res.json(stats);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/admin/analytics", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const games = await storage.getAllGames();
      
      const totalDownloads = games.reduce((sum: number, game) => sum + (game.downloads || 0), 0);
      
      const totalRating = games.reduce((sum: number, game) => sum + (game.averageRating || 0), 0);
      const averageRating = games.length > 0 ? Math.round(totalRating / games.length) : 0;
      const totalReviews = games.reduce((sum: number, game) => sum + (game.totalRatings || 0), 0);
      
      const topGames = [...games]
        .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
        .slice(0, 5);
      
      const categoryDownloads = games.reduce((acc: Record<string, number>, game) => {
        acc[game.category] = (acc[game.category] || 0) + (game.downloads || 0);
        return acc;
      }, {});
      const topCategory = Object.entries(categoryDownloads).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

      res.json({
        totalDownloads,
        downloadsThisWeek: 0,
        averageRating,
        totalReviews,
        activeUsers: 0,
        topCategory,
        topGames,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
