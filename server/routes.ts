import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertPostSchema, insertCommentSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "demo",
  api_key: process.env.CLOUDINARY_API_KEY || "api_key",
  api_secret: process.env.CLOUDINARY_API_SECRET || "api_secret"
});

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper function to upload image to Cloudinary
async function uploadToCloudinary(buffer: Buffer, originalname: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "muloqot-plus",
        public_id: `post_${Date.now()}_${originalname.split('.')[0]}`,
        transformation: [
          { width: 800, height: 600, crop: "limit", quality: "auto" }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result!.secure_url);
        }
      }
    );
    
    uploadStream.end(buffer);
  });
}

export function registerRoutes(app: Express): Server {
  // Set up authentication routes
  setupAuth(app);

  // Posts routes
  app.get("/api/posts", async (req, res) => {
    try {
      const { category, district, search, page = "1", limit = "20" } = req.query;
      const userId = req.user?.id;
      
      const posts = await storage.getPosts({
        category: category as string,
        district: district as string,
        search: search as string,
        limit: parseInt(limit as string),
        offset: (parseInt(page as string) - 1) * parseInt(limit as string),
        userId
      });
      
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      const post = await storage.getPost(postId, userId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      
      // Increment view count
      await storage.incrementPostViews(postId);
      
      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });

  app.post("/api/posts", upload.single("image"), async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      // Validate the request body
      const postData = insertPostSchema.parse(req.body);
      
      let imageUrl = null;
      if (req.file) {
        try {
          imageUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname);
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          // Continue without image if upload fails
        }
      }

      const post = await storage.createPost({
        ...postData,
        imageUrl,
        authorId: req.user!.id
      });

      // Send notification to government users in the same district
      const notificationMessage = {
        type: "post_created",
        title: "Новое обращение",
        message: `Новое обращение "${post.title}" в категории ${post.category}`,
        postId: post.id,
        district: post.district,
        category: post.category,
        timestamp: new Date().toISOString()
      };

      // Get all government users in the same district
      const allUsers = await storage.getAllUsers();
      const governmentUsers = allUsers.filter(user => 
        (user.role === 'government' && user.district === post.district) || 
        user.role === 'admin'
      );

      // Send notifications to government users
      if (governmentUsers.length > 0) {
        sendNotification(
          governmentUsers.map(user => user.id), 
          notificationMessage
        );
      }

      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid post data", details: error.errors });
      }
      console.error("Error creating post:", error);
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  app.patch("/api/posts/:id/status", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const postId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!["new", "in_progress", "resolved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      await storage.updatePostStatus(postId, status);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating post status:", error);
      res.status(500).json({ error: "Failed to update post status" });
    }
  });

  app.delete("/api/posts/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPost(postId);
      
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      // Only admin or post author can delete
      if (!req.user?.isAdmin && post.authorId !== req.user?.id) {
        return res.status(403).json({ error: "Permission denied" });
      }

      await storage.deletePost(postId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ error: "Failed to delete post" });
    }
  });

  // Like routes
  app.post("/api/posts/:id/like", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const postId = parseInt(req.params.id);
      const isLiked = await storage.togglePostLike(postId, req.user!.id);
      res.json({ liked: isLiked });
    } catch (error) {
      console.error("Error toggling post like:", error);
      res.status(500).json({ error: "Failed to toggle like" });
    }
  });

  // Comments routes
  app.get("/api/posts/:id/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      const comments = await storage.getComments(postId, userId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.post("/api/posts/:id/comments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const postId = parseInt(req.params.id);
      const commentData = insertCommentSchema.parse({ ...req.body, postId });
      
      const comment = await storage.createComment({
        ...commentData,
        authorId: req.user!.id
      });

      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid comment data", details: error.errors });
      }
      console.error("Error creating comment:", error);
      res.status(500).json({ error: "Failed to create comment" });
    }
  });

  app.post("/api/comments/:id/like", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const commentId = parseInt(req.params.id);
      const isLiked = await storage.toggleCommentLike(commentId, req.user!.id);
      res.json({ liked: isLiked });
    } catch (error) {
      console.error("Error toggling comment like:", error);
      res.status(500).json({ error: "Failed to toggle like" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // Admin routes for user management
  app.get("/api/admin/users", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id/role", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const userId = parseInt(req.params.id);
      const { role } = req.body;
      
      if (!["user", "government", "admin"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }

      await storage.updateUserRole(userId, role);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ error: "Failed to update user role" });
    }
  });

  // Enhanced post status updates for government users
  app.patch("/api/posts/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Only government and admin users can update status
    if (!["government", "admin"].includes(req.user?.role || "")) {
      return res.status(403).json({ error: "Government or admin access required" });
    }

    try {
      const postId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!["new", "in_progress", "resolved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      await storage.updatePostStatus(postId, status);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating post status:", error);
      res.status(500).json({ error: "Failed to update post status" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time notifications
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store connected clients with their user info
  const clients = new Map<number, WebSocket[]>();

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    let userId: number | null = null;

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'auth' && message.userId) {
          userId = message.userId;
          
          // Add client to user's connection list
          if (!clients.has(userId)) {
            clients.set(userId, []);
          }
          clients.get(userId)!.push(ws);
          
          console.log(`User ${userId} connected via WebSocket`);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      if (userId) {
        const userClients = clients.get(userId);
        if (userClients) {
          const index = userClients.indexOf(ws);
          if (index > -1) {
            userClients.splice(index, 1);
          }
          if (userClients.length === 0) {
            clients.delete(userId);
          }
        }
        console.log(`User ${userId} disconnected from WebSocket`);
      }
    });
  });

  // Function to send notifications to specific users
  const sendNotification = (userIds: number[], notification: any) => {
    userIds.forEach(userId => {
      const userClients = clients.get(userId);
      if (userClients) {
        userClients.forEach(ws => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'notification',
              ...notification
            }));
          }
        });
      }
    });
  };

  // Add notification sending to post creation
  const originalCreatePost = storage.createPost.bind(storage);
  storage.createPost = async (postData: any) => {
    const post = await originalCreatePost(postData);
    
    // Send notification to government users in the same district
    try {
      const governmentUsers = await storage.getAllUsers();
      const relevantGovUsers = governmentUsers.filter(user => 
        user.role === 'government' && 
        (user.district === postData.district || !user.district)
      );
      
      if (relevantGovUsers.length > 0) {
        sendNotification(
          relevantGovUsers.map(u => u.id),
          {
            notificationType: 'post_created',
            title: 'Новая жалоба',
            message: `Новая жалоба в категории "${postData.category}": ${postData.title}`,
            postId: post.id
          }
        );
      }
    } catch (error) {
      console.error('Error sending post creation notification:', error);
    }
    
    return post;
  };

  return httpServer;
}
