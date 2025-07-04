import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertPostSchema, insertCommentSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import sanitizeHtml from "sanitize-html";
import { body, validationResult } from "express-validator";
import { routeComplaintToAgency, updateAgencyLoad, generateInternalId, getAllAgencies, getTopPerformingAgencies } from "./government-routing";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "demo",
  api_key: process.env.CLOUDINARY_API_KEY || "api_key",
  api_secret: process.env.CLOUDINARY_API_SECRET || "api_secret"
});

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    // Only allow images and videos
    const allowedMimes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/mpeg', 'video/quicktime'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'));
    }
  }
});

// Input sanitization function
function sanitizeInput(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [], // No HTML tags allowed
    allowedAttributes: {},
  }).trim();
}

// Authorization middleware
function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

function requireRole(roles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// Post validation middleware
const validatePost = [
  body('title').isLength({ min: 1, max: 200 }).trim(),
  body('description').isLength({ min: 1, max: 1000 }).trim(),
  body('content').isLength({ min: 1, max: 5000 }).trim(),
  body('category').isLength({ min: 1 }).trim(),
  body('district').isLength({ min: 1 }).trim(),
  body('type').isIn(['complaint', 'initiative']).optional(),
];

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
      const { category, district, search, type, page = "1", limit = "20" } = req.query;
      const userId = req.user?.id;
      
      const posts = await storage.getPosts({
        category: category as string,
        district: district as string,
        search: search as string,
        type: type as string,
        limit: Math.max(1, Math.min(100, parseInt(limit as string) || 10)),
        offset: Math.max(0, (parseInt(page as string) || 1) - 1) * Math.max(1, Math.min(100, parseInt(limit as string) || 10)),
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

  app.post("/api/posts", requireAuth, upload.single("image"), validatePost, async (req: any, res: any) => {
    try {
      // Check validation results
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      // Sanitize and validate the request body
      const sanitizedData = {
        ...req.body,
        title: sanitizeInput(req.body.title),
        description: sanitizeInput(req.body.description),
        content: sanitizeInput(req.body.content),
        category: sanitizeInput(req.body.category),
        district: sanitizeInput(req.body.district),
      };

      const postData = insertPostSchema.parse(sanitizedData);
      
      let imageUrl = null;
      if (req.file) {
        try {
          imageUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname);
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          // Continue without image if upload fails
        }
      }

      // Only route complaints to government agencies (not initiatives)
      let routingResult = null;
      let assignedAgency = null;
      let agencyContact = null;
      let internalId = null;

      if (postData.type === 'complaint') {
        // Intelligent routing to appropriate government agency
        routingResult = routeComplaintToAgency(
          postData.category,
          postData.district,
          postData.content,
          postData.priority || 'medium'
        );
        
        assignedAgency = routingResult.agency.name;
        agencyContact = routingResult.agency.contact;
        internalId = generateInternalId(routingResult.agency.id, postData.category);
        
        // Update agency load
        updateAgencyLoad(routingResult.agency.id, 1);
        
        console.log(`🏛️ INTELLIGENT ROUTING: Complaint "${postData.title}" routed to ${assignedAgency} (Confidence: ${routingResult.confidence}%). Reason: ${routingResult.reasoning}`);
      }

      const post = await storage.createPost({
        ...postData,
        imageUrl,
        authorId: req.user!.id,
        assignedAgency,
        agencyContact,
        internalId
      });

      // Enhanced notification system with routing info
      const notificationMessage = {
        type: "post_created",
        title: postData.type === 'complaint' ? "Новая жалоба" : "Новая инициатива",
        message: postData.type === 'complaint' 
          ? `Жалоба "${post.title}" направлена в ${assignedAgency}. Номер: ${internalId}`
          : `Новая инициатива "${post.title}" требует голосования`,
        postId: post.id,
        district: post.district,
        category: post.category,
        assignedAgency,
        internalId,
        timestamp: new Date().toISOString()
      };

      // Get all government users in the same district, plus government users without district (handle all), plus admins
      const allUsers = await storage.getAllUsers();
      const governmentUsers = allUsers.filter(user => 
        (user.role === 'government' && (user.district === post.district || user.district === null)) || 
        user.role === 'admin'
      );
      
      console.log(`Post created in district: ${post.district}`);
      console.log(`Found ${governmentUsers.length} government users to notify:`, governmentUsers.map(u => ({ id: u.id, username: u.username, district: u.district })));

      // Store persistent notifications and send real-time notifications
      if (governmentUsers.length > 0) {
        console.log('Creating persistent notifications for user IDs:', governmentUsers.map(user => user.id));
        
        // Create persistent notifications in database
        for (const user of governmentUsers) {
          await storage.createNotification({
            userId: user.id,
            type: notificationMessage.type,
            title: notificationMessage.title,
            message: notificationMessage.message,
            postId: post.id,
            read: false
          });
        }
        
        // Also send real-time WebSocket notifications if users are online
        sendNotification(
          governmentUsers.map(user => user.id), 
          notificationMessage
        );
        
        console.log('Persistent and real-time notifications sent successfully');
      } else {
        console.log('No government users found to notify');
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

  app.patch("/api/posts/:id/status", requireRole(["admin", "government"]), async (req: any, res: any) => {

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

  // Vote routes
  app.post("/api/posts/:id/vote", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const postId = parseInt(req.params.id);
      const { voteType } = req.body;
      
      if (!voteType || !['upvote', 'downvote'].includes(voteType)) {
        return res.status(400).json({ error: "Invalid vote type" });
      }

      const voted = await storage.voteOnPost(postId, req.user!.id, voteType);
      const voteCount = await storage.getPostVoteCount(postId);
      
      res.json({ 
        voted, 
        votes: voteCount.upvotes - voteCount.downvotes,
        upvotes: voteCount.upvotes,
        downvotes: voteCount.downvotes
      });
    } catch (error) {
      console.error("Error voting on post:", error);
      res.status(500).json({ error: "Failed to vote on post" });
    }
  });

  app.get("/api/posts/:id/votes", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const voteCount = await storage.getPostVoteCount(postId);
      
      let userVote = null;
      if (req.isAuthenticated()) {
        userVote = await storage.getUserVoteOnPost(postId, req.user!.id);
      }
      
      res.json({ 
        votes: voteCount.upvotes - voteCount.downvotes,
        upvotes: voteCount.upvotes,
        downvotes: voteCount.downvotes,
        userVote
      });
    } catch (error) {
      console.error("Error getting post votes:", error);
      res.status(500).json({ error: "Failed to get post votes" });
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

      // Send WebSocket notification for new comment
      if (wss) {
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'comment_created',
              data: { postId, comment }
            }));
          }
        });
      }

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

  // Notification routes
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const notifications = await storage.getUserNotifications(req.user!.id);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationAsRead(notificationId, req.user.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  app.patch("/api/notifications/read-all", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      await storage.markAllNotificationsAsRead(req.user!.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ error: "Failed to mark all notifications as read" });
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
  app.get("/api/admin/users", requireRole(["admin"]), async (req: any, res: any) => {

    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id/role", requireRole(["admin"]), async (req: any, res: any) => {

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
          if (userId && !clients.has(userId)) {
            clients.set(userId, []);
          }
          if (userId) {
            const userClients = clients.get(userId);
            if (userClients) {
              userClients.push(ws);
            }
          }
          
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
    console.log(`Attempting to send notification to ${userIds.length} users:`, userIds);
    console.log('Current connected clients:', Array.from(clients.keys()));
    
    userIds.forEach(userId => {
      const userClients = clients.get(userId);
      if (userClients) {
        console.log(`Found ${userClients.length} connections for user ${userId}`);
        userClients.forEach(ws => {
          if (ws.readyState === WebSocket.OPEN) {
            console.log(`Sending notification to user ${userId}`);
            ws.send(JSON.stringify({
              type: 'notification',
              ...notification
            }));
          } else {
            console.log(`WebSocket for user ${userId} is not open, state:`, ws.readyState);
          }
        });
      } else {
        console.log(`No WebSocket connections found for user ${userId}`);
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

  // Government agency routes
  app.get("/api/government/agencies", async (req, res) => {
    try {
      const agencies = getAllAgencies();
      res.json(agencies);
    } catch (error) {
      console.error("Error fetching agencies:", error);
      res.status(500).json({ error: "Failed to fetch agencies" });
    }
  });

  app.get("/api/government/top-agencies", async (req, res) => {
    try {
      const { limit = "5" } = req.query;
      const topAgencies = getTopPerformingAgencies(parseInt(limit as string));
      res.json(topAgencies);
    } catch (error) {
      console.error("Error fetching top agencies:", error);
      res.status(500).json({ error: "Failed to fetch top agencies" });
    }
  });

  // Government admin panel routes
  app.post("/api/posts/:id/official-response", async (req, res) => {
    if (!req.isAuthenticated() || (req.user?.role !== 'government' && req.user?.role !== 'admin')) {
      return res.status(403).json({ error: "Government access required" });
    }

    try {
      const postId = parseInt(req.params.id);
      const { officialResponse, status, estimatedResolution } = req.body;
      
      if (!officialResponse) {
        return res.status(400).json({ error: "Official response is required" });
      }

      await storage.updatePostOfficialResponse(postId, {
        officialResponse,
        status: status || 'in_progress',
        responseDate: new Date(),
        estimatedResolution: estimatedResolution ? new Date(estimatedResolution) : null
      });

      // Send notification to complaint author
      const post = await storage.getPost(postId);
      if (post) {
        await storage.createNotification({
          userId: post.authorId,
          type: 'official_response',
          title: 'Получен официальный ответ',
          message: `На вашу жалобу "${post.title}" получен официальный ответ.`,
          postId: post.id,
          read: false
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error posting official response:", error);
      res.status(500).json({ error: "Failed to post official response" });
    }
  });

  app.get("/api/government/dashboard", async (req, res) => {
    if (!req.isAuthenticated() || (req.user?.role !== 'government' && req.user?.role !== 'admin')) {
      return res.status(403).json({ error: "Government access required" });
    }

    try {
      // Get posts assigned to user's district or agency
      const userDistrict = req.user?.district;
      const posts = await storage.getPosts({
        district: userDistrict || undefined,
        type: 'complaint',
        limit: 100
      });

      // Calculate statistics
      const stats = {
        totalComplaints: posts.length,
        newComplaints: posts.filter(p => p.status === 'new').length,
        inProgressComplaints: posts.filter(p => p.status === 'in_progress').length,
        resolvedComplaints: posts.filter(p => p.status === 'resolved').length,
        avgResponseTime: 0, // Calculate based on response dates
        myDistrict: userDistrict
      };

      res.json({ stats, recentComplaints: posts.slice(0, 10) });
    } catch (error) {
      console.error("Error fetching government dashboard:", error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  return httpServer;
}
