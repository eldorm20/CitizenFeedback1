# CitizenFeedback Development Guide

## Commands
- **Dev**: `npm run dev` - Start development server (client + server)
- **Build**: `npm run build` - Build client and server for production
- **Start**: `npm run start` - Run production build
- **Type check**: `npm run check` - TypeScript validation
- **Database**: `npm run db:push` - Push schema changes to database
- **No tests configured** - Project lacks testing setup

## Architecture
- **Monorepo**: client/ (React/Vite), server/ (Express), shared/ (schemas)
- **Database**: PostgreSQL with Drizzle ORM, schema in shared/schema.ts
- **Frontend**: React 18 + Vite, shadcn/ui components, TailwindCSS, Tanstack Query
- **Backend**: Express.js with Passport auth, session management, file upload (Cloudinary)
- **Real-time**: WebSocket support for notifications
- **Routing**: Client uses Wouter, server has Express routes

## Code Style
- **Imports**: Use `@/` for client src, `@shared/` for shared modules, third-party imports first
- **Components**: PascalCase names, kebab-case files, default exports (`export default function ComponentName()`)
- **Types**: TypeScript strict mode, Zod validation schemas, type-only imports with `type` keyword
- **Database**: Drizzle schema with relations, insert schemas for validation
- **Styling**: TailwindCSS utility-first, shadcn/ui components, responsive mobile-first design
- **Async**: Consistent async/await patterns, proper error handling middleware
