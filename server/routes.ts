import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const ADMIN_PASSWORD = "Coolgang57";

  // Session endpoint
  app.get("/api/session", async (req, res) => {
    if (req.session.userId) {
      const user = await storage.getUser(req.session.userId);
      if (user) {
        const { password, ...userWithoutPassword } = user;
        return res.json({ user: userWithoutPassword });
      }
    }
    res.json({ user: null });
  });

  // Authentication Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, licenseKey } = req.body;

      if (!username || !password || !licenseKey) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Validate license key
      const license = await storage.getLicense(licenseKey);
      if (!license) {
        return res.status(400).json({ message: "Invalid license key" });
      }
      if (!license.isActive) {
        return res.status(400).json({ message: "License key is inactive" });
      }
      if (license.usedBy) {
        return res.status(400).json({ message: "License key already used" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user (requires admin approval)
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        isAdmin: false,
        isApproved: false,
        licenseKey,
      });

      // Update license
      await storage.updateLicense(license.id, {
        usedBy: user.id,
        usedAt: new Date(),
      });

      // Set session
      req.session.userId = user.id;

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Check for admin login
      if (username === "admin" && password === ADMIN_PASSWORD) {
        // Check if admin user exists
        let adminUser = await storage.getUserByUsername("admin");

        // Create admin user if doesn't exist
        if (!adminUser) {
          const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
          adminUser = await storage.createUser({
            username: "admin",
            password: hashedPassword,
            isAdmin: true,
            isApproved: true,
            licenseKey: null,
          });
        }

        req.session.userId = adminUser.id;
        const { password: _, ...userWithoutPassword } = adminUser;
        return res.json({ user: userWithoutPassword, isAdmin: true });
      }

      // Regular user login
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check if account is approved
      if (!user.isApproved) {
        return res.status(403).json({ message: "Account pending admin approval" });
      }

      req.session.userId = user.id;

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, isAdmin: user.isAdmin });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  // Games Routes (Public)
  app.get("/api/games", async (req, res) => {
    try {
      const games = await storage.getAllGames();
      res.json(games);
    } catch (error) {
      console.error("Error fetching games:", error);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  app.get("/api/games/:id", async (req, res) => {
    try {
      const game = await storage.getGame(req.params.id);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(game);
    } catch (error) {
      console.error("Error fetching game:", error);
      res.status(500).json({ message: "Failed to fetch game" });
    }
  });

  // Downloads
  app.post("/api/downloads", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { gameId } = req.body;
      if (!gameId) {
        return res.status(400).json({ message: "Game ID is required" });
      }

      const game = await storage.getGame(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      const download = await storage.createDownload({
        userId: req.session.userId,
        gameId,
      });

      res.json(download);
    } catch (error) {
      console.error("Error creating download:", error);
      res.status(500).json({ message: "Failed to record download" });
    }
  });

  // User Library Routes
  app.get("/api/library", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const libraryEntries = await storage.getUserLibrary(req.session.userId);
      const gamesWithDetails = await Promise.all(
        libraryEntries.map(async (entry) => {
          const game = await storage.getGame(entry.gameId);
          return { ...entry, game };
        })
      );

      res.json(gamesWithDetails);
    } catch (error) {
      console.error("Error fetching library:", error);
      res.status(500).json({ message: "Failed to fetch library" });
    }
  });

  app.post("/api/library", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { gameId } = req.body;
      if (!gameId) {
        return res.status(400).json({ message: "Game ID is required" });
      }

      const game = await storage.getGame(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      const inLibrary = await storage.isInLibrary(req.session.userId, gameId);
      if (inLibrary) {
        return res.status(400).json({ message: "Game already in library" });
      }

      const libraryEntry = await storage.addToLibrary({
        userId: req.session.userId,
        gameId,
      });

      res.json(libraryEntry);
    } catch (error) {
      console.error("Error adding to library:", error);
      res.status(500).json({ message: "Failed to add to library" });
    }
  });

  app.delete("/api/library/:gameId", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      await storage.removeFromLibrary(req.session.userId, req.params.gameId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from library:", error);
      res.status(500).json({ message: "Failed to remove from library" });
    }
  });

  app.get("/api/library/check/:gameId", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const inLibrary = await storage.isInLibrary(req.session.userId, req.params.gameId);
      res.json({ inLibrary });
    } catch (error) {
      console.error("Error checking library:", error);
      res.status(500).json({ message: "Failed to check library" });
    }
  });

  // Admin middleware
  const requireAdmin = async (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    next();
  };

  // Admin Routes - Games
  app.post("/api/admin/games", requireAdmin, async (req, res) => {
    try {
      const game = await storage.createGame(req.body);
      res.json(game);
    } catch (error) {
      console.error("Error creating game:", error);
      res.status(500).json({ message: "Failed to create game" });
    }
  });

  app.patch("/api/admin/games/:id", requireAdmin, async (req, res) => {
    try {
      const game = await storage.updateGame(req.params.id, req.body);
      res.json(game);
    } catch (error) {
      console.error("Error updating game:", error);
      res.status(500).json({ message: "Failed to update game" });
    }
  });

  app.delete("/api/admin/games/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteGame(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting game:", error);
      res.status(500).json({ message: "Failed to delete game" });
    }
  });

  // Admin Routes - Licenses
  app.get("/api/admin/licenses", requireAdmin, async (req, res) => {
    try {
      const licenses = await storage.getAllLicenses();
      res.json(licenses);
    } catch (error) {
      console.error("Error fetching licenses:", error);
      res.status(500).json({ message: "Failed to fetch licenses" });
    }
  });

  app.post("/api/admin/licenses", requireAdmin, async (req, res) => {
    try {
      const key = req.body.key || randomBytes(16).toString("hex").toUpperCase();
      const license = await storage.createLicense({
        key,
        isActive: true,
      });
      res.json(license);
    } catch (error) {
      console.error("Error creating license:", error);
      res.status(500).json({ message: "Failed to create license" });
    }
  });

  app.patch("/api/admin/licenses/:id", requireAdmin, async (req, res) => {
    try {
      const license = await storage.updateLicense(req.params.id, req.body);
      res.json(license);
    } catch (error) {
      console.error("Error updating license:", error);
      res.status(500).json({ message: "Failed to update license" });
    }
  });

  // Admin Routes - Users
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Admin Routes - Stats
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
