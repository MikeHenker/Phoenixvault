# GameVault - Game Distribution Platform

## Overview

GameVault is a Steam/Epic Games-inspired game distribution platform built with a modern web stack. It provides a beta-access gaming platform where users can discover, browse, and download games using license keys. The application features a sophisticated dark interface with immersive gaming-focused experiences, including a public landing page, authenticated user library, and a comprehensive admin panel for managing games, licenses, and users.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server with HMR support
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and caching

**UI Component System**
- Shadcn/ui component library based on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Design system inspired by Steam/Epic Games Store with dark theme emphasis
- Custom color system using CSS variables for theming (HSL-based)
- Google Fonts integration (Montserrat for headers, Inter/Roboto for body text)

**State Management Strategy**
- React Query handles all server state with automatic caching and invalidation
- Session-based authentication state managed through `/api/session` endpoint
- No global client state management library - component-level state with hooks

### Backend Architecture

**Server Framework**
- Express.js as the HTTP server
- TypeScript for type safety across the codebase
- Session-based authentication using express-session with secure cookie configuration
- RESTful API design pattern with `/api/*` routes

**Authentication & Authorization**
- Bcrypt for password hashing
- Session-based authentication (not JWT)
- Role-based access control with `isAdmin` flag on user model
- Protected routes with middleware checking session state
- License key validation system for user registration

**API Structure**
- `/api/auth/*` - Authentication endpoints (login, register, logout)
- `/api/session` - Current user session data
- `/api/games` - CRUD operations for games
- `/api/licenses` - License key management
- `/api/users` - User management
- `/api/downloads` - Download tracking and statistics

### Data Storage

**Database**
- PostgreSQL via Neon serverless (connection pooling)
- Drizzle ORM for type-safe database queries and schema management
- Schema-first approach with TypeScript types generated from database schema

**Schema Design**
- `users` table: Authentication, role management, license key association
- `licenses` table: License keys with activation status and usage tracking
- `games` table: Game metadata including title, description, images, download URLs, categories, tags, and featured status
- `downloads` table: Junction table tracking user downloads for analytics

**Data Relationships**
- One-to-many: User to Downloads
- One-to-many: Game to Downloads
- One-to-one: License to User (via `usedBy` foreign key)

### External Dependencies

**Core Runtime Dependencies**
- `@neondatabase/serverless` - Neon PostgreSQL serverless driver with WebSocket support
- `drizzle-orm` - Type-safe ORM for PostgreSQL
- `express-session` - Session management middleware
- `bcryptjs` - Password hashing and verification
- `ws` - WebSocket library for Neon database connections

**UI Component Libraries**
- `@radix-ui/*` - Comprehensive set of unstyled, accessible UI primitives
- `tailwindcss` - Utility-first CSS framework
- `class-variance-authority` - Type-safe variant styling
- `clsx` & `tailwind-merge` - Conditional className utilities

**Form & Validation**
- `react-hook-form` - Form state management
- `@hookform/resolvers` - Validation resolver integration
- `zod` - Schema validation (via drizzle-zod)
- `drizzle-zod` - Zod schema generation from Drizzle schemas

**Development & Build Tools**
- `vite` - Fast build tool and dev server
- `tsx` - TypeScript execution for development
- `esbuild` - Production bundling for server code
- `@replit/*` plugins - Replit-specific development enhancements

**Asset Management**
- Unsplash images used as placeholder game imagery
- Custom hero banner stored in `/attached_assets/generated_images/`
- Static assets served from `/public` directory after build