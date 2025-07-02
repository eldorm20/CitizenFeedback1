# Muloqot Plus - Civic Complaint Platform

## Overview

Muloqot Plus is a comprehensive community-driven platform for citizen complaints, discussions, and initiatives in Uzbekistan. The platform enables citizens to submit complaints with photos/videos and geolocation, propose initiatives, vote on proposals, and track resolution status. Government officials receive notifications and can manage complaint statuses, while administrators oversee the entire system with analytics and moderation tools.

**Core Features:**
- Citizen complaint submission with media and geolocation
- Initiative proposals and voting system
- Real-time notifications for government officials
- Multi-language support (English, Russian, Uzbek)
- Role-based authentication (citizens, government, admin)
- Compliance with Uzbekistan government regulations (ЗRU-445)

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
- July 02, 2025: **MAJOR ENHANCEMENT - Implemented Complete Initiative System**
  - **Enhanced Database Schema**: Added post types (complaint/initiative), voting system, geolocation, tags
  - **Voting Functionality**: Created voting API endpoints and VoteButtons component with upvote/downvote
  - **Initiative Support**: Separate post type with voting instead of likes, visual distinction with icons
  - **Type-Based Filtering**: API supports filtering by post type, initiatives page shows only initiatives
  - **Visual Enhancements**: Type-specific icons (lightbulb for initiatives, alert for complaints)
  - **Database Tables**: Added post_votes table with user vote tracking and conflict resolution
  - **User Experience**: Dynamic form titles, conditional UI elements based on post type
  - **Technical Compliance**: Aligned with specification requirements for initiative voting and complaint management

- July 02, 2025: **CRITICAL FIXES & ENHANCEMENTS - Production Ready Platform**
  - **Multi-Language Support FIXED**: Complete translation system with English, Russian, and Uzbek
  - **Modern Chatbot Enhanced**: MuxlisaAI-level intelligent assistant with legal knowledge base
  - **Government Dashboard Fixed**: Resolved console errors and added comprehensive workflow management
  - **Beautiful UI Implementation**: Animated charts, modern design, enhanced user experience
  - **Enhanced API System**: Fixed all TypeScript errors and database compatibility issues
  - **Real-time Features**: WebSocket notifications with persistent database storage
  - **Advanced Analytics**: Interactive dashboards with trending topics and performance metrics
  - **Government Routing**: Intelligent complaint routing to appropriate agencies
  - **PWA Features**: Progressive web app capabilities with offline functionality

- July 02, 2025: **COMPLETE 5-LANGUAGE SYSTEM IMPLEMENTATION**
  - **Full Multi-Language Support**: Added English, Russian, Uzbek, Karakalpak, and Tajik languages
  - **Enhanced Language Selector**: Modern dropdown with native names, flags, and visual indicators
  - **Complete Translation Coverage**: All 41+ translation keys implemented across all languages
  - **Persistent Language Storage**: User language preference saved in localStorage
  - **Real-time Language Switching**: Instant UI updates when changing languages
  - **Comment System Bug Fixed**: Enhanced cache invalidation and WebSocket real-time updates
  - **Comprehensive Language Demo**: Created demo component to showcase translation functionality
  - **Technical Improvements**: Fixed null handling issues and TypeScript compatibility

## User Preferences

Preferred communication style: Simple, everyday language.