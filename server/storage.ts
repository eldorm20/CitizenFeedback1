import { users, posts, comments, postLikes, commentLikes, postVotes, notifications, type User, type InsertUser, type Post, type InsertPost, type Comment, type InsertComment, type PostVote, type PostWithAuthor, type CommentWithAuthor, type Notification, type InsertNotification } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count, ilike, or } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Post methods
  getPosts(options?: {
    category?: string;
    district?: string;
    search?: string;
    type?: string;
    limit?: number;
    offset?: number;
    userId?: number;
  }): Promise<PostWithAuthor[]>;
  getPost(id: number, userId?: number): Promise<PostWithAuthor | undefined>;
  createPost(post: InsertPost & { authorId: number }): Promise<Post>;
  updatePostStatus(id: number, status: string): Promise<void>;
  deletePost(id: number): Promise<void>;
  incrementPostViews(id: number): Promise<void>;
  
  // Comment methods
  getComments(postId: number, userId?: number): Promise<CommentWithAuthor[]>;
  createComment(comment: InsertComment & { authorId: number }): Promise<Comment>;
  deleteComment(id: number): Promise<void>;
  
  // Like methods
  togglePostLike(postId: number, userId: number): Promise<boolean>;
  toggleCommentLike(commentId: number, userId: number): Promise<boolean>;
  
  // Vote methods
  voteOnPost(postId: number, userId: number, voteType: 'upvote' | 'downvote'): Promise<boolean>;
  getPostVoteCount(postId: number): Promise<{ upvotes: number; downvotes: number }>;
  getUserVoteOnPost(postId: number, userId: number): Promise<'upvote' | 'downvote' | null>;
  
  // Admin methods
  getStats(): Promise<{
    totalPosts: number;
    resolvedPosts: number;
    newPosts: number;
    inProgressPosts: number;
    totalUsers: number;
  }>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(userId: number, role: string): Promise<void>;
  
  // Notification methods
  getUserNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
  
  // Government methods
  updatePostOfficialResponse(id: number, response: {
    officialResponse: string;
    status?: string;
    responseDate?: Date;
    estimatedResolution?: Date | null;
  }): Promise<void>;
  
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getPosts(options: {
    category?: string;
    district?: string;
    search?: string;
    type?: string;
    limit?: number;
    offset?: number;
    userId?: number;
  } = {}): Promise<PostWithAuthor[]> {
    const {
      category,
      district,
      search,
      type,
      limit = 20,
      offset = 0,
      userId
    } = options;

    // Build conditions array
    const conditions = [];
    if (category) {
      conditions.push(eq(posts.category, category));
    }
    if (district) {
      conditions.push(eq(posts.district, district));
    }
    if (type) {
      conditions.push(eq(posts.type, type));
    }
    if (search) {
      conditions.push(
        or(
          ilike(posts.title, `%${search}%`),
          ilike(posts.content, `%${search}%`)
        )
      );
    }

    // Build query with proper condition handling
    let query = db
      .select({
        post: posts,
        author: users
      })
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id));

    // Apply conditions if any
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    return result.map(row => ({
      ...row.post,
      author: row.author,
      comments: [],
      isLiked: false // We'll handle likes separately for now
    }));
  }

  async getPost(id: number, userId?: number): Promise<PostWithAuthor | undefined> {
    // Build query step by step to avoid SQL syntax errors
    let query = db
      .select({
        post: posts,
        author: users,
        isLiked: sql<boolean>`false`
      })
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id));

    // Add like join if userId provided
    if (userId) {
      query = query.leftJoin(
        postLikes, 
        and(eq(postLikes.postId, posts.id), eq(postLikes.userId, userId))
      );
    }

    const [result] = await query.where(eq(posts.id, id));

    if (!result) return undefined;

    const postComments = await this.getComments(id, userId);

    return {
      ...result.post,
      author: result.author,
      comments: postComments,
      isLiked: result.isLiked
    };
  }

  async createPost(post: InsertPost & { authorId: number }): Promise<Post> {
    const [newPost] = await db
      .insert(posts)
      .values(post)
      .returning();
    return newPost;
  }

  async updatePostStatus(id: number, status: string): Promise<void> {
    await db
      .update(posts)
      .set({ status, updatedAt: new Date() })
      .where(eq(posts.id, id));
  }

  async deletePost(id: number): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }

  async incrementPostViews(id: number): Promise<void> {
    await db
      .update(posts)
      .set({ views: sql`${posts.views} + 1` })
      .where(eq(posts.id, id));
  }

  async getComments(postId: number, userId?: number): Promise<CommentWithAuthor[]> {
    const result = await db
      .select({
        comment: comments,
        author: users,
        isLiked: userId ? 
          sql<boolean>`case when ${commentLikes.userId} is not null then true else false end` :
          sql<boolean>`false`
      })
      .from(comments)
      .innerJoin(users, eq(comments.authorId, users.id))
      .leftJoin(
        commentLikes, 
        userId ? and(eq(commentLikes.commentId, comments.id), eq(commentLikes.userId, userId)) : undefined
      )
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));

    return result.map(row => ({
      ...row.comment,
      author: row.author,
      isLiked: row.isLiked
    }));
  }

  async createComment(comment: InsertComment & { authorId: number }): Promise<Comment> {
    const [newComment] = await db
      .insert(comments)
      .values(comment)
      .returning();
    return newComment;
  }

  async deleteComment(id: number): Promise<void> {
    await db.delete(comments).where(eq(comments.id, id));
  }

  async togglePostLike(postId: number, userId: number): Promise<boolean> {
    const [existingLike] = await db
      .select()
      .from(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));

    if (existingLike) {
      await db
        .delete(postLikes)
        .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
      
      await db
        .update(posts)
        .set({ likes: sql`${posts.likes} - 1` })
        .where(eq(posts.id, postId));
      
      return false;
    } else {
      await db
        .insert(postLikes)
        .values({ postId, userId });
      
      await db
        .update(posts)
        .set({ likes: sql`${posts.likes} + 1` })
        .where(eq(posts.id, postId));
      
      return true;
    }
  }

  async toggleCommentLike(commentId: number, userId: number): Promise<boolean> {
    const [existingLike] = await db
      .select()
      .from(commentLikes)
      .where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.userId, userId)));

    if (existingLike) {
      await db
        .delete(commentLikes)
        .where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.userId, userId)));
      
      await db
        .update(comments)
        .set({ likes: sql`${comments.likes} - 1` })
        .where(eq(comments.id, commentId));
      
      return false;
    } else {
      await db
        .insert(commentLikes)
        .values({ commentId, userId });
      
      await db
        .update(comments)
        .set({ likes: sql`${comments.likes} + 1` })
        .where(eq(comments.id, commentId));
      
      return true;
    }
  }

  async getStats(): Promise<{
    totalPosts: number;
    resolvedPosts: number;
    newPosts: number;
    inProgressPosts: number;
    totalUsers: number;
  }> {
    const [stats] = await db
      .select({
        totalPosts: count(posts.id),
        resolvedPosts: sql<number>`cast(count(case when ${posts.status} = 'resolved' then 1 end) as int)`,
        newPosts: sql<number>`cast(count(case when ${posts.status} = 'new' then 1 end) as int)`,
        inProgressPosts: sql<number>`cast(count(case when ${posts.status} = 'in_progress' then 1 end) as int)`,
      })
      .from(posts);

    const [userStats] = await db
      .select({
        totalUsers: count(users.id)
      })
      .from(users);

    return {
      totalPosts: stats.totalPosts,
      resolvedPosts: stats.resolvedPosts,
      newPosts: stats.newPosts,
      inProgressPosts: stats.inProgressPosts,
      totalUsers: userStats.totalUsers
    };
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserRole(userId: number, role: string): Promise<void> {
    await db.update(users).set({ role }).where(eq(users.id, userId));
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [result] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return result;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, userId));
  }

  async updatePostOfficialResponse(id: number, response: {
    officialResponse: string;
    status?: string;
    responseDate?: Date;
    estimatedResolution?: Date | null;
  }): Promise<void> {
    await db
      .update(posts)
      .set({
        officialResponse: response.officialResponse,
        status: response.status || 'in_progress',
        responseDate: response.responseDate,
        estimatedResolution: response.estimatedResolution,
        updatedAt: new Date()
      })
      .where(eq(posts.id, id));
  }

  async voteOnPost(postId: number, userId: number, voteType: 'upvote' | 'downvote'): Promise<boolean> {
    try {
      // First, check if user already voted
      const existingVote = await db
        .select()
        .from(postVotes)
        .where(and(eq(postVotes.postId, postId), eq(postVotes.userId, userId)))
        .limit(1);

      if (existingVote.length > 0) {
        // Update existing vote
        if (existingVote[0].voteType === voteType) {
          // Remove vote if clicking same vote type
          await db
            .delete(postVotes)
            .where(and(eq(postVotes.postId, postId), eq(postVotes.userId, userId)));
          await this.updatePostVoteCount(postId);
          return false;
        } else {
          // Change vote type
          await db
            .update(postVotes)
            .set({ voteType })
            .where(and(eq(postVotes.postId, postId), eq(postVotes.userId, userId)));
        }
      } else {
        // Create new vote
        await db
          .insert(postVotes)
          .values({ postId, userId, voteType });
      }

      await this.updatePostVoteCount(postId);
      return true;
    } catch (error) {
      console.error('Error voting on post:', error);
      return false;
    }
  }

  private async updatePostVoteCount(postId: number): Promise<void> {
    const [voteCount] = await db
      .select({
        votes: sql<number>`cast(count(case when ${postVotes.voteType} = 'upvote' then 1 end) - count(case when ${postVotes.voteType} = 'downvote' then 1 end) as int)`
      })
      .from(postVotes)
      .where(eq(postVotes.postId, postId));

    await db
      .update(posts)  
      .set({ votes: voteCount.votes })
      .where(eq(posts.id, postId));
  }

  async getPostVoteCount(postId: number): Promise<{ upvotes: number; downvotes: number }> {
    const [result] = await db
      .select({
        upvotes: sql<number>`cast(count(case when ${postVotes.voteType} = 'upvote' then 1 end) as int)`,
        downvotes: sql<number>`cast(count(case when ${postVotes.voteType} = 'downvote' then 1 end) as int)`
      })
      .from(postVotes)
      .where(eq(postVotes.postId, postId));

    return result || { upvotes: 0, downvotes: 0 };
  }

  async getUserVoteOnPost(postId: number, userId: number): Promise<'upvote' | 'downvote' | null> {
    const [vote] = await db
      .select()
      .from(postVotes)
      .where(and(eq(postVotes.postId, postId), eq(postVotes.userId, userId)))
      .limit(1);

    return vote ? (vote.voteType as 'upvote' | 'downvote') : null;
  }
}

export const storage = new DatabaseStorage();
