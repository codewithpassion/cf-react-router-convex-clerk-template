# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ MANDATORY REQUIREMENTS - READ FIRST
1. **NO `any` TYPES IN TYPESCRIPT** - This project uses strict TypeScript with Biome. Using `any` will break the build.
2. **RUN `bun check` BEFORE PRESENTING CODE** - Verify all type checking passes
3. **USE PROPER TYPES** - Import from libraries, define interfaces, or use `unknown` with type guards

# React Router Cloudflare Todo App

A modern, production-ready React application using React Router 7 deployed to Cloudflare with authentication, server-side rendering, and database integration.

## Essential Commands

### Development
```bash
bun dev              # Start dev server at http://localhost:5173
bun check            # Run all checks (types, linting, formatting)
bun biome:check      # Run Biome linter and formatter only
```

### Supabase Database
```bash
# Run database migrations (when using Supabase CLI)
npx supabase migration up
npx supabase db push    # Push migrations to production
```

### Build & Deploy
```bash
bun build            # Build for production
bun preview          # Preview production build locally
bun deploy           # Build and deploy to Cloudflare
bun deploy:staging   # Deploy to staging environment
bun deploy:prod      # Deploy to production environment
```

### Debugging
```bash
bun tail:prod        # Stream production logs
bun tail:staging     # Stream staging logs
wrangler secret put VARIABLE_NAME # Add production secrets
```

## Architecture Overview

### Project Structure
- `/app` - Frontend React code (routes, components, hooks)
- `/supabase` - Supabase migrations and schema
- `/workers` - Cloudflare Workers entry points

### Key Technologies
- **Frontend**: React 19, React Router 7, TypeScript, TailwindCSS, ShadCN UI
- **Backend**: Cloudflare Workers, Hono, Supabase
- **Database**: Supabase (PostgreSQL) with real-time subscriptions
- **Auth**: Clerk authentication (external service) + Supabase RLS
- **Tooling**: Bun, Biome, Wrangler

### Path Aliases
- `~/*` - Maps to `/app/*` (frontend imports)
- `~~/*` - Maps to root-level packages (worker imports)

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
// Supabase types - ALWAYS import from generated files
import type { Database } from "~/lib/database.types";
type UserRow = Database["public"]["Tables"]["users"]["Row"];

// Clerk types - import from Clerk packages
import type { User } from "@clerk/nextjs/server";

// React Router types
import type { Route } from "./+types/route-name";

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

// Form data - define interfaces
interface FormData {
  email: string;
  password: string;
}

// NEVER DO THIS:
// const user: any = getData();  ❌
// const props: any = { ... };   ❌
// function process(data: any)   ❌
```

## Supabase Data Layer

### Schema Location
- Database migrations: `/supabase/migrations/`
- Type definitions: `/app/lib/database.types.ts`

### Data Access Patterns
1. **Service Classes**: Define database operations in `/app/lib/db/`
2. **Frontend Hooks**: Use React Query hooks with Supabase services
3. **Real-time Updates**: Supabase real-time subscriptions
4. **Error Handling**: Always handle loading and error states in components
5. **Row Level Security**: Use RLS policies for data access control

## Authentication System

### User Roles
- `user` - Default role for all users
- `admin` - Administrative access  
- `superadmin` - Full system access

### Clerk Authentication
- Authentication is handled by Clerk (external service)
- User roles stored in Clerk's publicMetadata
- Sign in/up via Clerk's prebuilt components
- Session management handled by Clerk

### Protected Routes
- Routes under `_auth.*` require authentication
- Admin routes check for admin/superadmin roles
- Use Supabase RLS policies for data access control
- Clerk user data synced to Supabase automatically

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