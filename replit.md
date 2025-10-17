# Phoenix Games - Gaming Platform

## Overview

Phoenix Games is a full-stack gaming marketplace platform built with React, Express, and PostgreSQL. The application enables users to browse, download, and review games while providing administrators with comprehensive management tools for games, users, support tickets, and game requests. The platform features a bold, fiery phoenix-themed design inspired by gaming platforms like Steam and Epic Games Store.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tool**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast hot module replacement
- Single-page application (SPA) using Wouter for lightweight client-side routing

**UI Component System**
- Shadcn/ui component library with Radix UI primitives for accessible, customizable components
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for managing component variants
- Custom theming system supporting multiple color schemes (Dark Phoenix, Light Phoenix, Midnight Blaze, Cyber Phoenix, Forest Fire)

**State Management & Data Fetching**
- TanStack Query (React Query) for server state management, caching, and synchronization
- React Context API for global authentication and theme state
- Local storage for persisting authentication tokens and user preferences

**Key Features**
- **Rich Text Editing**: Enhanced Tiptap editor with advanced formatting (bold, italic, strikethrough, code blocks, blockquotes, undo/redo) - no API key required
- **Video Trailers**: YouTube video embed support for game trailers with responsive player
- **Game Details Tabs**: Organized tabbed interface (About/Reviews/Screenshots) for better content organization
- **Related Games**: Smart similar games recommendations (filtered to exclude adult content)
- **Social Sharing**: Native share API support with clipboard fallback for game sharing
- **Visual Rating System**: Interactive rating distribution charts with progress bars showing 1-5 star breakdown
- **Quick Actions**: Dropdown menu with report, share, and copy game ID options
- **Platform Badges**: Icon-based platform indicators (Windows/Mac/Linux) using Lucide React icons
- **Download Time Estimator**: Calculates estimated download time based on file size
- **Enhanced Game Cards**: Related games feature badges (Hot/New), download stats, and hover effects
- **Advanced Search & Filtering**: Multi-criteria search with category, platform, and age rating filters
- **Smart Sorting**: Sort games by A-Z, Z-A, popularity, newest, and highest rated
- **Adult Content Filtering**: Dedicated Adult Zone with age verification and content segregation
- **Download Link Management**: Multiple mirror support with copy-to-clipboard functionality
- **Image Galleries**: Screenshot viewing with modal lightbox
- **Download Tracking**: Complete download history with timestamps
- **User Favorites**: Bookmark and manage favorite games
- **Review System**: User ratings and comments with visual analytics
- **Responsive Design**: Mobile-first approach with optimized layouts for all devices

### Backend Architecture

**Server Framework**
- Express.js as the web application framework
- RESTful API design for client-server communication
- JWT-based authentication with bcrypt for password hashing

**Database Layer**
- PostgreSQL as the primary relational database
- Drizzle ORM for type-safe database queries and migrations
- Neon serverless PostgreSQL for database hosting
- WebSocket support via ws library for real-time database connections

**API Structure**
- `/api/auth/*` - Authentication endpoints (register, login, session management)
- `/api/games/*` - Game CRUD operations and trending games
- `/api/users/*` - User management (admin only)
- `/api/support/*` - Support ticket management
- `/api/requests/*` - Game request handling
- `/api/favorites/*` - User favorite games
- `/api/reviews/*` - Game reviews and ratings
- `/api/download-history/*` - Download tracking
- `/api/admin/analytics` - Analytics and statistics

**Middleware & Security**
- JWT token verification for protected routes
- Role-based access control (admin/user roles)
- Request logging and error handling middleware
- CORS and JSON parsing middleware

### Data Model

**Core Entities**
- **Users**: Authentication, profile information, role-based permissions
- **Games**: Title, description, media (images/trailers/screenshots), download links, categories, platforms, ratings
- **Support Tickets**: User inquiries with status tracking (open, in-progress, resolved) and priority levels
- **Game Requests**: User-submitted game suggestions with approval workflow
- **Favorites**: User-game relationship for bookmarking
- **Reviews**: User ratings and comments on games
- **Recently Viewed**: Browsing history tracking
- **Download History**: Download tracking with timestamps

**Relationships**
- One-to-many: User → Support Tickets, Game Requests, Favorites, Reviews, Download History
- Many-to-one: Reviews, Favorites → Games

### Authentication & Authorization

**Authentication Flow**
- JWT tokens stored in localStorage
- Token validation on protected API routes
- Automatic token refresh via context provider
- Session persistence across page reloads

**Authorization Levels**
- **User Role**: Browse games, download, submit requests/tickets, manage favorites
- **Admin Role**: Full CRUD operations on games, user management, ticket resolution, request approval/rejection, analytics access

### File Structure

**Monorepo Organization**
- `/client` - Frontend React application
- `/server` - Backend Express server
- `/shared` - Shared TypeScript types and database schema
- `/migrations` - Database migration files

**Key Directories**
- `/client/src/components` - Reusable UI components
- `/client/src/pages` - Route-based page components
- `/client/src/lib` - Utilities, authentication, theming, query client
- `/server/routes.ts` - API route definitions
- `/server/storage.ts` - Database access layer abstraction
- `/shared/schema.ts` - Drizzle schema definitions

## External Dependencies

### Third-Party Services

**Database**
- Neon Serverless PostgreSQL for scalable database hosting
- WebSocket connections for real-time data access

**UI Component Libraries**
- Radix UI primitives (dialogs, dropdowns, accordions, etc.)
- Lucide React for iconography
- Framer Motion for animations

**Development & Build Tools**
- Replit-specific plugins for development environment integration
- ESBuild for server bundling in production
- PostCSS with Autoprefixer for CSS processing

### Key NPM Packages

**Backend**
- `express` - Web framework
- `drizzle-orm` - Database ORM
- `@neondatabase/serverless` - PostgreSQL driver
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `ws` - WebSocket support

**Frontend**
- `react` & `react-dom` - UI library
- `@tanstack/react-query` - Data fetching and caching
- `wouter` - Routing
- `@tiptap/react` - Rich text editor
- `tailwindcss` - Styling framework
- `zod` - Schema validation
- `framer-motion` - Animation library

**Shared**
- `drizzle-zod` - Database schema to Zod validation
- TypeScript for type safety across the stack

### Design Assets

- Custom phoenix logo images stored in `/attached_assets`
- Google Fonts: Inter (primary) and Orbitron (display/branding)
- External image URLs for game covers and backgrounds