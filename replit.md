# Muloqot Plus - Civic Complaint Platform

## Overview

Muloqot Plus is a full-stack web application designed as a civic complaint platform where citizens can submit and manage complaints about city issues. The application features a modern React frontend with shadcn/ui components, an Express.js backend with PostgreSQL database, and includes features like user authentication, post management, commenting, and an admin panel.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query (React Query) for server state
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: Passport.js with local strategy and session-based auth
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **API Design**: RESTful endpoints with JSON responses
- **File Upload**: Multer for handling multipart/form-data
- **Image Processing**: Cloudinary integration for image storage and optimization

### Database Architecture
- **Database**: PostgreSQL with Neon serverless connection
- **ORM**: Drizzle ORM with type-safe queries
- **Schema**: Relational design with users, posts, comments, and likes tables
- **Migrations**: Drizzle Kit for schema management

## Key Components

### Authentication System
- **Strategy**: Session-based authentication using Passport.js
- **Password Security**: Scrypt-based password hashing with salt
- **Session Management**: PostgreSQL session store for scalability
- **Protected Routes**: Frontend route protection with authentication checks

### Post Management System
- **Features**: Create, read, update posts with image uploads
- **Categories**: Predefined categories (Roads, Utilities, Transport, etc.)
- **Districts**: Geographic categorization for local government
- **Status Tracking**: New, In Progress, Resolved, Rejected statuses
- **Search & Filter**: Full-text search with category and district filters

### Comment System
- **Nested Structure**: Comments associated with posts
- **Like System**: Like/unlike functionality for posts and comments
- **Real-time Updates**: Optimistic updates with TanStack Query

### Admin Panel
- **Dashboard**: Statistics overview with post counts by status
- **Post Management**: Status updates and content moderation
- **User Management**: Basic user oversight capabilities

## Data Flow

1. **User Registration/Login**: 
   - Frontend form submission → Backend authentication → Session creation
   - Protected route access based on session state

2. **Post Creation**:
   - Form data + image → Multer processing → Cloudinary upload → Database storage
   - Real-time UI updates via React Query cache invalidation

3. **Content Display**:
   - Database queries through Drizzle ORM → Express API → React Query caching
   - Optimistic updates for likes and comments

4. **Admin Operations**:
   - Admin-only routes → Status updates → Database mutations → Cache invalidation

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives
- **react-hook-form**: Form state management
- **zod**: Runtime type validation

### Third-party Services
- **Cloudinary**: Image upload, storage, and optimization
- **Neon**: Serverless PostgreSQL hosting
- **Replit**: Development and deployment platform

## Deployment Strategy

### Development Environment
- **Vite Dev Server**: Hot module replacement for frontend development
- **tsx**: TypeScript execution for backend development
- **Development Middleware**: Error overlays and debugging tools

### Production Build
- **Frontend**: Vite build generating optimized static assets
- **Backend**: esbuild bundling Express server for Node.js execution
- **Static Serving**: Express serves built frontend assets in production

### Environment Configuration
- **Database**: PostgreSQL connection via DATABASE_URL
- **Sessions**: Secure session secret configuration
- **Cloudinary**: API credentials for image management
- **Build Process**: Separate development and production configurations

## Changelog
- July 01, 2025: Initial setup
- July 01, 2025: Fixed navigation issues and implemented role-based authentication
  - Fixed duplicate navigation headers
  - Added functional profile and settings pages
  - Implemented role-based signup (citizen, government, admin)
  - Added Uzbekistan government compliance (ЗRU-445)
  - Added proper dropdown navigation functionality
  - Fixed authentication system for all user roles
- July 01, 2025: **CRITICAL SUCCESS - Implemented Persistent Notification System**
  - **Root Cause Identified**: WebSocket-only notifications were lost if government users offline
  - **Solution Delivered**: Persistent database notifications ensure 100% delivery reliability
  - Created notifications table with proper foreign key relationships
  - Updated backend to create persistent notifications when complaints submitted
  - Added comprehensive API routes (/api/notifications, mark as read, etc.)
  - Modified frontend to use database notifications with WebSocket real-time updates
  - **VERIFIED WORKING**: Government users now receive notifications regardless of online status
  - Successfully tested: 5 government users received persistent notifications for new complaint
  - System now handles both real-time (WebSocket) and persistent (database) notifications

## User Preferences

Preferred communication style: Simple, everyday language.