# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ MANDATORY REQUIREMENTS - READ FIRST
1. **NO `any` TYPES IN TYPESCRIPT** - This project uses strict TypeScript with Biome. Using `any` will break the build.
2. **RUN `bun check` BEFORE PRESENTING CODE** - Verify all type checking passes
3. **USE PROPER TYPES** - Import from libraries, define interfaces, or use `unknown` with type guards
4. **USE TABS FOR INDENTATION** - This project uses tabs, not spaces
5. **USE DOUBLE QUOTES** - For all strings in TypeScript/JavaScript

# React Router Cloudflare Todo App

A modern, production-ready React application using React Router 7 deployed to Cloudflare Workers with authentication, server-side rendering, and PostgreSQL database integration via Drizzle ORM.

## Essential Commands

### Development
```bash
bun dev              # Start dev server at http://localhost:5173
bun check            # Run all checks (types, linting, formatting)
bun biome:check      # Run Biome linter and formatter only
bun cf-typegen       # Generate Cloudflare environment types
```

### Database Management (Drizzle ORM)
```bash
bun db:generate      # Generate SQL migrations from schema changes
bun db:migrate       # Run migrations locally
bun db:push          # Push schema to database (be careful in production)
bun db:studio        # Open Drizzle Studio for database management
```

### Build & Deploy
```bash
bun build            # Build for production
bun build:staging    # Build for staging environment
bun build:prod       # Build for production environment
bun preview          # Preview production build locally
bun deploy           # Build and deploy to Cloudflare
bun deploy:staging   # Deploy to staging environment
bun deploy:prod      # Deploy to production environment
```

### Debugging & Monitoring
```bash
bun tail:prod        # Stream production logs
bun tail:staging     # Stream staging logs
bun start            # Run with wrangler dev
wrangler secret put VARIABLE_NAME    # Add production secrets
wrangler versions upload              # Deploy preview URL
wrangler versions deploy              # Promote version to production
```

## Architecture Overview

### Project Structure
```
/
├── app/                  # React application code
│   ├── routes/          # React Router route files
│   ├── components/      # React components
│   │   ├── ui/         # ShadCN UI components
│   │   ├── features/   # Feature-specific components
│   │   ├── layouts/    # Layout components
│   │   └── shared/     # Shared components
│   ├── lib/            # Utility functions and services
│   │   ├── db/        # Database service layer (Drizzle ORM)
│   │   └── *.ts       # Various utilities
│   └── hooks/          # Custom React hooks
├── drizzle/            # Database migrations (Drizzle Kit generated)
├── supabase/           # Supabase specific files
│   └── migrations/     # Supabase migrations (currently empty)
├── workers/            # Cloudflare Workers entry points
│   ├── app.ts         # Main worker entry
│   ├── types.ts       # Worker type definitions
│   └── *.ts           # Worker utilities
├── ai_docs/            # AI documentation
└── public/             # Static assets
```

### Key Technologies
- **Frontend**: React 19, React Router 7, TypeScript, TailwindCSS 4.0
- **UI Components**: ShadCN UI, Radix UI primitives
- **Backend**: Cloudflare Workers, Hono framework
- **Database**:
  - PostgreSQL (via Supabase or direct connection)
  - Drizzle ORM for type-safe database operations
  - Supabase client for real-time subscriptions
- **Authentication**: Clerk (external service)
- **State Management**: React Query (TanStack Query)
- **Tooling**: Bun, Biome, Wrangler, Vite
- **Deployment**: Cloudflare Workers/Pages

### Path Aliases
- `~/*` - Maps to `/app/*` and `/api/*` (application code)
- `~~/*` - Maps to `/workers/*` (worker code)
- `+types/*` - Maps to React Router generated types

## Code Style & Conventions

### 🚨 CRITICAL TypeScript Rules - MUST FOLLOW
**ABSOLUTELY NO `any` TYPES ALLOWED - THIS IS NON-NEGOTIABLE**
- The codebase uses TypeScript in strict mode with Biome linting
- Using `any` type will cause build failures and require rework
- **Before writing ANY TypeScript code:**
  1. Understand the existing types being used
  2. Import proper types from libraries
  3. Define explicit interfaces/types when needed
  4. Use `unknown` and type guards if type is truly unknown
  5. Use generic types `<T>` for flexible but type-safe code

**Instead of `any`, use:**
- `unknown` - for truly unknown types (requires type guards)
- `Record<string, unknown>` - for objects with unknown structure
- Specific types like `string`, `number`, `boolean`
- Union types like `string | number`
- Imported types from libraries (e.g., `import type { User } from "@clerk/nextjs/server"`)
- Defined interfaces or type aliases
- Generic constraints like `<T extends object>`

### Formatting Rules
- **Indentation**: Tabs (not spaces)
- **Quotes**: Double quotes for strings
- **Imports**: Auto-organized by Biome
- **Linting**: Always run `bun check` after changes

### Naming Conventions
- React components: `PascalCase`
- Files: `kebab-case`
- Variables/functions: `camelCase`
- Database tables: `snake_case`

### Common Type Patterns in This Codebase
```typescript
// Drizzle ORM types - infer from schema
import { users, todos } from "~/lib/db/schema";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
type User = InferSelectModel<typeof users>;
type NewUser = InferInsertModel<typeof users>;

// Supabase types - import from generated files
import type { Database } from "~/lib/database.types";
type UserRow = Database["public"]["Tables"]["users"]["Row"];

// Clerk types - import from Clerk packages
import type { User } from "@clerk/clerk-react";
import type { ClerkClient } from "@clerk/backend";

// React Router types
import type { Route } from "./+types/route-name";
export async function loader({ request }: Route.LoaderArgs) {}
export async function action({ request }: Route.ActionArgs) {}

// Component props - define explicit interfaces
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

// API responses - use proper typing
interface ApiResponse<T> {
  data: T;
  error?: string;
}

// Form data with Zod validation
import { z } from "zod";
const TodoSchema = z.object({
  text: z.string().min(1),
  completed: z.boolean().default(false)
});
type TodoFormData = z.infer<typeof TodoSchema>;

// NEVER DO THIS:
// const user: any = getData();  ❌
// const props: any = { ... };   ❌
// function process(data: any)   ❌
```

## Database Architecture

### Dual Database System
This project uses both **Drizzle ORM** and **Supabase Client**:
- **Drizzle ORM**: Primary database ORM for type-safe queries and migrations
- **Supabase Client**: Used for real-time subscriptions and authentication sync

### Schema & Types
- **Drizzle Schema**: `/app/lib/db/schema.ts` - Source of truth for database schema
- **Supabase Types**: `/app/lib/database.types.ts` - Generated types for Supabase client
- **Migrations**: `/drizzle/*.sql` - Auto-generated by Drizzle Kit

### Database Tables
```typescript
// Users table (synced from Clerk)
users {
  id: uuid (primary key)
  clerk_id: string (unique)
  email: string (unique)
  name: string | null
  image_url: string | null
  roles: string[] (default: ["user"])
  created_at: timestamp
  updated_at: timestamp
}

// Todos table
todos {
  id: uuid (primary key)
  user_id: uuid (foreign key -> users.id)
  text: string
  completed: boolean (default: false)
  created_at: timestamp
}
```

### Data Access Patterns
1. **Service Layer**: Database operations in `/app/lib/db/*.server.ts`
2. **Type Safety**: Always use Drizzle's typed queries
3. **React Query**: Use hooks for client-side data fetching
4. **Server Actions**: Use `.server.ts` files for server-only code
5. **Connection**: Database connection in `/app/lib/db/connection.server.ts`

### Example Database Operations
```typescript
// Service layer example
import { db } from "~/lib/db/connection.server";
import { todos } from "~/lib/db/schema";
import { eq } from "drizzle-orm";

// Get todos for a user
export async function getUserTodos(userId: string) {
  return await db
    .select()
    .from(todos)
    .where(eq(todos.userId, userId));
}

// Create a new todo
export async function createTodo(data: NewTodo) {
  return await db.insert(todos).values(data).returning();
}
```

## Authentication System (Clerk)

### User Roles
- `user` - Default role for all authenticated users
- `admin` - Administrative access to user management
- `superadmin` - Full system access including settings

### Clerk Integration
- **Provider**: Clerk handles all authentication
- **User Sync**: Clerk users automatically synced to database via webhook/middleware
- **Role Storage**: Roles stored in both Clerk's publicMetadata and database
- **Components**: Using `@clerk/clerk-react` and `@clerk/react-router`
- **Admin SDK**: Server-side user management via `/app/lib/clerk-admin.server.ts`

### Route Protection Patterns
```typescript
// Public routes
/_index.tsx           // Homepage
/login._index.tsx    // Login page
/sign-up._index.tsx  // Sign-up page

// Protected routes (require authentication)
/_auth.*.tsx         // All routes with _auth prefix
/_auth.todos.tsx     // User's todo list

// Admin routes (require admin/superadmin role)
/_auth.admin.*.tsx   // Admin dashboard and sub-pages
```

### Permission Checks
- Client-side: Use Clerk's `useUser()` hook
- Server-side: Check user roles from database or Clerk SDK
- Permissions utility: `/app/lib/permissions.ts`

## React Router 7 Conventions

### Route File Naming
- `_index.tsx` - Index routes
- `$param.tsx` - Dynamic segments
- `_auth.tsx` - Layout route for authenticated pages
- `_auth.todos.tsx` - Nested protected route
- `api.resource.ts` - API routes

### Route Exports
```typescript
import type { Route } from "./+types/route-name";

// SEO metadata
export const meta: Route.MetaFunction = () => {
  return [
    { title: "Page Title" },
    { name: "description", content: "Page description" }
  ];
};

// Data loading
export async function loader({ request, params }: Route.LoaderArgs) {
  // Fetch and return data
  return { data };
}

// Form actions
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  // Process form submission
  return { success: true };
}

// Component
export default function RouteName({ loaderData }: Route.ComponentProps) {
  return <div>{/* Component JSX */}</div>;
}
```

## Environment Variables

### Configuration Files
- `wrangler.jsonc` - Public variables in `vars` section
- `.env` - Local development secrets
- `.env.example` - Documentation of required secrets

### Type Generation
After modifying environment variables:
1. Update `wrangler.jsonc`
2. Run `bun cf-typegen` to regenerate types
3. Types appear in `worker-configuration.d.ts` (auto-generated)

### Required Secrets
- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk publishable key (client-side)
- `CLERK_SECRET_KEY` - Clerk secret key (server-side)
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

## Component Development

### ShadCN Components
```bash
bunx --bun shadcn@latest add button  # Add new component
```
Components are installed to `/app/components/ui/`

### Component Patterns
- Use `PublicLayout` wrapper for pages with navigation/footer
- Handle loading states with `LoadingSpinner` component
- Show errors with proper error boundaries
- Use `toast` for user notifications

## Deployment Environments

### Development
- URL: http://localhost:5173
- Database: Local Supabase instance or hosted Supabase project
- Email: Mock email service (logs to console)

### Staging
- Build: `bun build:staging`
- Deploy: `bun deploy:staging`
- Logs: `bun tail:staging`

### Production
- Database: Production Supabase deployment
- Deploy: `bun deploy:prod`
- Logs: `bun tail:prod`

## Common Development Tasks

### Adding a New API Endpoint
1. Create service class methods in `/app/lib/db/` directory
2. Define database operations with proper types
3. Use React Query hooks in React components

### Adding a New Page
1. Create route file in `/app/routes/`
2. Use `_auth.` prefix for protected routes
3. Add `meta` export for SEO
4. Wrap in `PublicLayout` if needed

### Modifying Database Schema
1. Create new migration in `/supabase/migrations/`
2. Update type definitions in `/app/lib/database.types.ts`
3. Update service classes as needed
4. Test locally and deploy to production

## Troubleshooting

### Type Errors - MUST FIX IMMEDIATELY
**If you encounter type errors, DO NOT use `any` to bypass them:**
- Run `bun check` to see all type errors
- Check that `bun cf-typegen` was run after env changes
- **Common fixes for type errors:**
  - Import the correct type from the library
  - Check existing code for how similar types are handled
  - Define a proper interface or type alias
  - Use `unknown` with type narrowing if type is dynamic
  - Look for existing type definitions in the codebase
- **NEVER commit or present code with `any` types**

### Database Errors
- Check Supabase service class methods and return types
- Verify database schema matches type definitions
- Use Supabase dashboard for debugging queries and logs

### Authentication Issues
- Check magic link expiration (15 minutes)
- Verify email service configuration
- Check user roles in database

## Best Practices

### Performance
- Use React Query for server state management
- Implement proper loading states
- Use Suspense boundaries where appropriate
- Optimize images with Cloudflare Image Resizing
- Leverage Cloudflare's edge caching

### Security
- Never expose sensitive data in client code
- Use environment variables for secrets
- Implement proper RBAC with Clerk roles
- Validate all user inputs with Zod
- Use HTTPS everywhere
- Keep dependencies updated

### Code Quality
- Write comprehensive TypeScript types
- Follow the established file structure
- Use meaningful variable and function names
- Keep components small and focused
- Write server code in `.server.ts` files
- Test critical paths

### Git Workflow
- Create feature branches
- Write clear commit messages
- Run `bun check` before committing
- Use PR template if available
- Request code reviews