# Overview

MealPlan is a family meal planning and grocery management application designed to simplify weekly meal preparation while optimizing grocery shopping efficiency. The system helps families generate diverse weekly meal suggestions, automatically create grocery lists, manage pantry inventory, and maintain a database of family-approved recipes with ratings.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with dedicated routes for recipes, meal plans, grocery items, pantry items, and stores
- **Validation**: Zod schemas for request/response validation
- **Storage**: Abstract storage interface with in-memory implementation (extensible to database)

## Data Storage Solutions
- **Database**: PostgreSQL configured through Drizzle ORM
- **Schema**: Comprehensive schema with tables for recipes, meal plans, recipe ratings, grocery items, pantry items, and stores
- **Migration Management**: Drizzle Kit for database migrations
- **Connection**: Neon Database serverless PostgreSQL

## Database Schema Design
- **Recipes**: Stores recipe information including ingredients, instructions, cuisine type, prep time, and special flags (leftovers, non-perishable)
- **Meal Plans**: Weekly meal planning with day-of-week tracking and meal type categorization
- **Recipe Ratings**: Family member ratings system (okay/good/great) for recipe evaluation
- **Grocery Items**: Shopping list management with store preferences and meal associations
- **Pantry Items**: Inventory tracking with stock levels and expiration dates
- **Stores**: Store management for optimized shopping routing

## Component Architecture
- **Modular Design**: Separate components for meal planning, grocery lists, pantry management, and recipe database
- **UI Consistency**: Standardized component library with consistent styling and behavior
- **Responsive Design**: Mobile-first approach with responsive layouts

## Development Tools
- **Type Safety**: Full TypeScript coverage across frontend, backend, and shared schemas
- **Code Quality**: ESLint and TypeScript compiler for code validation
- **Development Experience**: Hot module replacement with Vite, runtime error overlay
- **Path Aliases**: Organized import structure with @ aliases for cleaner code organization

# External Dependencies

## UI and Design
- **Radix UI**: Headless UI primitives for accessible components
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Component variant management
- **Embla Carousel**: Carousel functionality for UI components

## Data Management
- **TanStack Query**: Server state management and caching
- **Drizzle ORM**: Type-safe database ORM
- **Drizzle Zod**: Schema validation integration
- **Zod**: Runtime type validation

## Database and Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **Connect PG Simple**: PostgreSQL session store for Express

## Development and Build Tools
- **Vite**: Fast build tool and development server
- **TSX**: TypeScript execution for development
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Autoprefixer

## Form and Input Handling
- **React Hook Form**: Form state management
- **React Day Picker**: Date selection components
- **Input OTP**: One-time password input components

## Utilities
- **Date FNS**: Date manipulation and formatting
- **CLSX**: Conditional CSS class utilities
- **Nanoid**: Unique ID generation
- **CMDK**: Command menu functionality