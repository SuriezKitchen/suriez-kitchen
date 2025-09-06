# Overview

This is a chef's portfolio website showcasing Chef Isabella's culinary journey through gourmet dishes and YouTube vlogs. The application serves as a digital showcase featuring a gallery of culinary creations, embedded YouTube videos, an about section, and social media integration. Built as a full-stack web application with a React frontend and Express backend, it demonstrates modern web development practices with a focus on visual appeal and user experience.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing  
- **Styling**: Tailwind CSS with custom design system using warm, culinary-themed colors
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **API Design**: RESTful API with dedicated endpoints for dishes, videos, and social links
- **Data Layer**: Drizzle ORM with PostgreSQL database for type-safe database operations
- **Development**: In-memory storage fallback for development/demo purposes
- **Environment**: Environment variable configuration for API keys and database connections

## Database Schema
- **Dishes Table**: Stores culinary creations with title, description, image URL, and category
- **Videos Table**: YouTube video metadata with view counts, like counts, and publication dates
- **Social Links Table**: Platform links with usernames and active status flags
- **Migration Support**: Drizzle migrations for schema versioning and updates

## Component Architecture
- **Section-based Layout**: Modular sections (Hero, Gallery, Videos, About, Contact, Footer)
- **Responsive Design**: Mobile-first approach with comprehensive breakpoint coverage
- **Animation System**: Scroll-reveal animations and smooth transitions for enhanced UX
- **Navigation**: Fixed navigation with smooth scrolling to sections

# External Dependencies

## Core Technologies
- **Database**: PostgreSQL with Neon serverless database integration
- **ORM**: Drizzle ORM for type-safe database operations with Zod schema validation
- **UI Framework**: Radix UI components for accessibility and Tailwind CSS for styling
- **Fonts**: Google Fonts integration (Playfair Display, Inter) for typography hierarchy

## Third-party Integrations
- **YouTube API**: YouTube Data API v3 for fetching channel videos and metadata
- **Image Hosting**: Unsplash integration for high-quality food photography
- **Font Awesome**: Icon library for social media and UI icons
- **Development Tools**: Replit-specific plugins for development environment integration

## Build and Development
- **Package Manager**: npm with lock file for consistent dependencies
- **TypeScript**: Full TypeScript configuration with path aliases and strict type checking
- **PostCSS**: Autoprefixer and Tailwind CSS processing
- **ESBuild**: Production bundling for server-side code