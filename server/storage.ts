import { users, posts, comments, postLikes, commentLikes, type User, type InsertUser, type Post, type InsertPost, type Comment, type InsertComment, type PostWithAuthor, type CommentWithAuthor } from "@shared/schema";
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
  
  // Admin methods
  getStats(): Promise<{
    totalPosts: number;
    resolvedPosts: number;
    newPosts: number;
    inProgressPosts: number;
    totalUsers: number;
  }>;
  
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
    limit?: number;
    offset?: number;
    userId?: number;
  } = {}): Promise<PostWithAuthor[]> {
    const {
      category,
      district,
      search,
      limit = 20,
      offset = 0,
      userId
    } = options;

    let query = db
      .select({
        post: posts,
        author: users,
        commentCount: sql<number>`cast(count(${comments.id}) as int)`,
        isLiked: userId ? 
          sql<boolean>`case when ${postLikes.userId} is not null then true else false end` :
          sql<boolean>`false`
      })
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id))
      .leftJoin(comments, eq(comments.postId, posts.id))
      .leftJoin(
        postLikes, 
        userId ? and(eq(postLikes.postId, posts.id), eq(postLikes.userId, userId)) : undefined
      )
      .groupBy(posts.id, users.id, postLikes.userId)
      .orderBy(desc(posts.createdAt));

    // Add filters
    const conditions = [];
    if (category) {
      conditions.push(eq(posts.category, category));
    }
    if (district) {
      conditions.push(eq(posts.district, district));
    }
    if (search) {
      conditions.push(
        or(
          ilike(posts.title, `%${search}%`),
          ilike(posts.content, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query.limit(limit).offset(offset);

    return result.map(row => ({
      ...row.post,
      author: row.author,
      comments: [],
      isLiked: row.isLiked
    }));
  }

  async getPost(id: number, userId?: number): Promise<PostWithAuthor | undefined> {
    const [result] = await db
      .select({
        post: posts,
        author: users,
        isLiked: userId ? 
          sql<boolean>`case when ${postLikes.userId} is not null then true else false end` :
          sql<boolean>`false`
      })
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id))
      .leftJoin(
        postLikes, 
        userId ? and(eq(postLikes.postId, posts.id), eq(postLikes.userId, userId)) : undefined
      )
      .where(eq(posts.id, id));

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
}

export const storage = new DatabaseStorage();
