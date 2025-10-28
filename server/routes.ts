import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { getSteamGameDetails, searchSteamGames } from "./steam-api";

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

  app.patch("/api/library/:gameId", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { hasLocalFiles, exePath } = req.body;
      const libraryEntry = await storage.updateLibraryEntry(req.session.userId, req.params.gameId, {
        hasLocalFiles,
        exePath,
      });

      res.json(libraryEntry);
    } catch (error) {
      console.error("Error updating library entry:", error);
      res.status(500).json({ message: "Failed to update library entry" });
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

  app.get("/api/admin/download-stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getDownloadStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching download stats:", error);
      res.status(500).json({ message: "Failed to fetch download stats" });
    }
  });

  // Admin Routes - Bulk Operations
  app.post("/api/admin/games/bulk-delete", requireAdmin, async (req, res) => {
    try {
      const { gameIds } = req.body;
      if (!Array.isArray(gameIds)) {
        return res.status(400).json({ message: "gameIds must be an array" });
      }
      await storage.bulkDeleteGames(gameIds);
      res.json({ success: true });
    } catch (error) {
      console.error("Error bulk deleting games:", error);
      res.status(500).json({ message: "Failed to bulk delete games" });
    }
  });

  app.post("/api/admin/games/bulk-toggle", requireAdmin, async (req, res) => {
    try {
      const { gameIds, isActive } = req.body;
      if (!Array.isArray(gameIds) || typeof isActive !== "boolean") {
        return res.status(400).json({ message: "Invalid request body" });
      }
      await storage.bulkToggleGameActive(gameIds, isActive);
      res.json({ success: true });
    } catch (error) {
      console.error("Error bulk toggling games:", error);
      res.status(500).json({ message: "Failed to bulk toggle games" });
    }
  });

  // Reviews Routes
  app.get("/api/games/:gameId/reviews", async (req, res) => {
    try {
      const reviews = await storage.getGameReviews(req.params.gameId);
      
      const reviewsWithUsers = await Promise.all(
        reviews.map(async (review) => {
          const user = await storage.getUser(review.userId);
          return {
            ...review,
            username: user?.username || "Unknown",
          };
        })
      );

      res.json(reviewsWithUsers);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { gameId, rating, comment } = req.body;
      if (!gameId || !rating) {
        return res.status(400).json({ message: "Game ID and rating are required" });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }

      const existingReview = await storage.getUserReview(req.session.userId, gameId);
      if (existingReview) {
        const updatedReview = await storage.updateReview(existingReview.id, { rating, comment });
        return res.json(updatedReview);
      }

      const review = await storage.createReview({
        userId: req.session.userId,
        gameId,
        rating,
        comment: comment || null,
      });

      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.delete("/api/reviews/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      await storage.deleteReview(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ message: "Failed to delete review" });
    }
  });

  app.get("/api/reviews/check/:gameId", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const review = await storage.getUserReview(req.session.userId, req.params.gameId);
      res.json({ review: review || null });
    } catch (error) {
      console.error("Error checking review:", error);
      res.status(500).json({ message: "Failed to check review" });
    }
  });

  // Wishlist Routes
  app.get("/api/wishlist", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const wishlistEntries = await storage.getUserWishlist(req.session.userId);
      const gamesWithDetails = await Promise.all(
        wishlistEntries.map(async (entry) => {
          const game = await storage.getGame(entry.gameId);
          return { ...entry, game };
        })
      );

      res.json(gamesWithDetails);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  app.post("/api/wishlist", async (req, res) => {
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

      const inWishlist = await storage.isInWishlist(req.session.userId, gameId);
      if (inWishlist) {
        return res.status(400).json({ message: "Game already in wishlist" });
      }

      const wishlistEntry = await storage.addToWishlist({
        userId: req.session.userId,
        gameId,
      });

      res.json(wishlistEntry);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      res.status(500).json({ message: "Failed to add to wishlist" });
    }
  });

  app.delete("/api/wishlist/:gameId", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      await storage.removeFromWishlist(req.session.userId, req.params.gameId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      res.status(500).json({ message: "Failed to remove from wishlist" });
    }
  });

  app.get("/api/wishlist/check/:gameId", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const inWishlist = await storage.isInWishlist(req.session.userId, req.params.gameId);
      res.json({ inWishlist });
    } catch (error) {
      console.error("Error checking wishlist:", error);
      res.status(500).json({ message: "Failed to check wishlist" });
    }
  });

  // Download history
  app.get("/api/downloads/history", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const downloads = await storage.getDownloadsByUser(req.session.userId);
      const downloadsWithGames = await Promise.all(
        downloads.map(async (download) => {
          const game = await storage.getGame(download.gameId);
          return { ...download, game };
        })
      );

      res.json(downloadsWithGames);
    } catch (error) {
      console.error("Error fetching download history:", error);
      res.status(500).json({ message: "Failed to fetch download history" });
    }
  });

  // Friends/Follow System
  app.get("/api/users/:userId/followers", async (req, res) => {
    try {
      const followers = await storage.getFollowers(req.params.userId);
      res.json(followers);
    } catch (error) {
      console.error("Error fetching followers:", error);
      res.status(500).json({ message: "Failed to fetch followers" });
    }
  });

  app.get("/api/users/:userId/following", async (req, res) => {
    try {
      const following = await storage.getFollowing(req.params.userId);
      res.json(following);
    } catch (error) {
      console.error("Error fetching following:", error);
      res.status(500).json({ message: "Failed to fetch following" });
    }
  });

  app.post("/api/users/:userId/follow", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      if (req.session.userId === req.params.userId) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }

      const follow = await storage.followUser(req.session.userId, req.params.userId);
      
      // Create activity
      await storage.createActivity({
        userId: req.session.userId,
        type: "follow",
        targetUserId: req.params.userId,
        gameId: null,
        metadata: null,
      });

      res.json(follow);
    } catch (error) {
      console.error("Error following user:", error);
      res.status(500).json({ message: "Failed to follow user" });
    }
  });

  app.delete("/api/users/:userId/follow", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      await storage.unfollowUser(req.session.userId, req.params.userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unfollowing user:", error);
      res.status(500).json({ message: "Failed to unfollow user" });
    }
  });

  app.get("/api/users/:userId/follow-status", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.json({ isFollowing: false });
      }

      const isFollowing = await storage.isFollowing(req.session.userId, req.params.userId);
      res.json({ isFollowing });
    } catch (error) {
      console.error("Error checking follow status:", error);
      res.status(500).json({ message: "Failed to check follow status" });
    }
  });

  // User Profiles
  app.get("/api/users/:userId/profile", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      const stats = await storage.getUserStats(req.params.userId);
      
      res.json({ user: userWithoutPassword, stats });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  app.put("/api/profile", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { avatarUrl, bio, location } = req.body;
      const updatedUser = await storage.updateUserProfile(req.session.userId, {
        avatarUrl,
        bio,
        location,
      });

      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Achievements
  app.get("/api/games/:gameId/achievements", async (req, res) => {
    try {
      const achievements = await storage.getGameAchievements(req.params.gameId);
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  app.get("/api/users/:userId/achievements", async (req, res) => {
    try {
      const achievements = await storage.getUserAchievements(req.params.userId);
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      res.status(500).json({ message: "Failed to fetch user achievements" });
    }
  });

  app.post("/api/achievements/:achievementId/unlock", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const unlocked = await storage.unlockAchievement(req.session.userId, req.params.achievementId);
      
      // Create activity
      const achievement = await storage.getAchievement(req.params.achievementId);
      await storage.createActivity({
        userId: req.session.userId,
        type: "achievement",
        gameId: achievement.gameId,
        targetUserId: null,
        metadata: JSON.stringify({ achievementId: req.params.achievementId }),
      });

      res.json(unlocked);
    } catch (error) {
      console.error("Error unlocking achievement:", error);
      res.status(500).json({ message: "Failed to unlock achievement" });
    }
  });

  // Playtime Tracking
  app.get("/api/users/:userId/playtime", async (req, res) => {
    try {
      const playtime = await storage.getUserPlaytime(req.params.userId);
      res.json(playtime);
    } catch (error) {
      console.error("Error fetching playtime:", error);
      res.status(500).json({ message: "Failed to fetch playtime" });
    }
  });

  app.post("/api/playtime/:gameId", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { minutes } = req.body;
      const playtime = await storage.updatePlaytime(req.session.userId, req.params.gameId, minutes);
      res.json(playtime);
    } catch (error) {
      console.error("Error updating playtime:", error);
      res.status(500).json({ message: "Failed to update playtime" });
    }
  });

  // Comments
  app.get("/api/games/:gameId/comments", async (req, res) => {
    try {
      const comments = await storage.getGameComments(req.params.gameId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/games/:gameId/comments", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { content, parentId } = req.body;
      const comment = await storage.createComment({
        userId: req.session.userId,
        gameId: req.params.gameId,
        content,
        parentId: parentId || null,
      });

      // Create activity
      await storage.createActivity({
        userId: req.session.userId,
        type: "comment",
        gameId: req.params.gameId,
        targetUserId: null,
        metadata: null,
      });

      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.put("/api/comments/:commentId", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { content } = req.body;
      const comment = await storage.updateComment(req.params.commentId, req.session.userId, content);
      res.json(comment);
    } catch (error) {
      console.error("Error updating comment:", error);
      res.status(500).json({ message: "Failed to update comment" });
    }
  });

  app.delete("/api/comments/:commentId", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      await storage.deleteComment(req.params.commentId, req.session.userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  // Screenshots
  app.get("/api/games/:gameId/screenshots", async (req, res) => {
    try {
      const screenshots = await storage.getGameScreenshots(req.params.gameId);
      res.json(screenshots);
    } catch (error) {
      console.error("Error fetching screenshots:", error);
      res.status(500).json({ message: "Failed to fetch screenshots" });
    }
  });

  app.post("/api/games/:gameId/screenshots", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { imageUrl, caption } = req.body;
      const screenshot = await storage.createScreenshot({
        gameId: req.params.gameId,
        userId: req.session.userId,
        imageUrl,
        caption: caption || null,
      });

      res.json(screenshot);
    } catch (error) {
      console.error("Error creating screenshot:", error);
      res.status(500).json({ message: "Failed to create screenshot" });
    }
  });

  app.delete("/api/screenshots/:screenshotId", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      await storage.deleteScreenshot(req.params.screenshotId, req.session.userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting screenshot:", error);
      res.status(500).json({ message: "Failed to delete screenshot" });
    }
  });

  // Activity Feed
  app.get("/api/activity/feed", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const activities = await storage.getActivityFeed(req.session.userId);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activity feed:", error);
      res.status(500).json({ message: "Failed to fetch activity feed" });
    }
  });

  app.get("/api/users/:userId/activity", async (req, res) => {
    try {
      const activities = await storage.getUserActivity(req.params.userId);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching user activity:", error);
      res.status(500).json({ message: "Failed to fetch user activity" });
    }
  });

  // Trending and Popular Games
  app.get("/api/games/trending", async (req, res) => {
    try {
      const trending = await storage.getTrendingGames();
      res.json(trending);
    } catch (error) {
      console.error("Error fetching trending games:", error);
      res.status(500).json({ message: "Failed to fetch trending games" });
    }
  });

  app.get("/api/games/popular", async (req, res) => {
    try {
      const popular = await storage.getPopularGames();
      res.json(popular);
    } catch (error) {
      console.error("Error fetching popular games:", error);
      res.status(500).json({ message: "Failed to fetch popular games" });
    }
  });

  // Game Recommendations
  app.get("/api/recommendations", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const recommendations = await storage.getRecommendations(req.session.userId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  // Steam API Integration
  app.get("/api/steam/search", async (req, res) => {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }

      const results = await searchSteamGames(query);
      res.json(results);
    } catch (error) {
      console.error("Error searching Steam:", error);
      res.status(500).json({ message: "Failed to search Steam" });
    }
  });

  app.get("/api/steam/details/:appId", async (req, res) => {
    try {
      const details = await getSteamGameDetails(req.params.appId);
      if (!details) {
        return res.status(404).json({ message: "Game not found on Steam" });
      }
      res.json(details);
    } catch (error) {
      console.error("Error fetching Steam details:", error);
      res.status(500).json({ message: "Failed to fetch game details from Steam" });
    }
  });

  app.post("/api/admin/games/import-steam", requireAdmin, async (req, res) => {
    try {
      const { appId } = req.body;
      if (!appId) {
        return res.status(400).json({ message: "Steam App ID is required" });
      }

      const steamData = await getSteamGameDetails(appId);
      if (!steamData) {
        return res.status(404).json({ message: "Game not found on Steam" });
      }

      // Create game with Steam data
      const game = await storage.createGame({
        title: steamData.name,
        description: steamData.shortDescription,
        imageUrl: steamData.headerImage,
        category: steamData.genres[0] || 'Action',
        tags: steamData.genres,
        downloadUrl: '', // Admin needs to provide this
        releaseDate: steamData.releaseDate,
        developer: steamData.developers[0] || '',
        publisher: steamData.publishers[0] || '',
        isActive: true,
        averageRating: 0,
        totalReviews: 0,
      });

      // Create screenshots
      for (const screenshot of steamData.screenshots.slice(0, 6)) {
        await storage.createScreenshot({
          gameId: game.id,
          userId: req.session.userId!,
          imageUrl: screenshot.pathFull,
          caption: null,
        });
      }

      res.json({ game, steamData });
    } catch (error) {
      console.error("Error importing from Steam:", error);
      res.status(500).json({ message: "Failed to import game from Steam" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
