# Changelog


## [2025-09-22 21:57:44]

### fix: add proper TypeScript types to all API routes and hooks

**Changes:**
- Updated api.todos.ts route
- Updated api.users.ts route
- Updated features component
- Updated use-clerk-supabase-sync hook
- Updated use-supabase-query hook
- Updated use-user-management hook
- New function: handleResponse
- New function: TodoItem
- New function: action
- New function: json
- New function: loader
- Database schema updates
- Drizzle ORM updates
- Convex integration updates
- Database migrations updates
- Clerk authentication updates

**Frontend Components:**
- Modified `todo-item.tsx` in app/components/features/todos
- Modified `todo-list.tsx` in app/components/features/todos
- Modified `entry.server.tsx` in app
- Modified `use-clerk-supabase-sync.ts` in app/hooks
- Modified `use-supabase-query.ts` in app/hooks
- Modified `use-user-management.ts` in app/hooks
- Modified `api.todos.ts` in app/routes
- Modified `api.users.ts` in app/routes

**Database:**
- Added `schema.ts` in app/lib/db
- Added `0000_vengeful_xorn.sql` in drizzle

**Configuration:**
- Added `drizzle.config.ts`
- Added `0000_snapshot.json` in drizzle/meta
- Added `_journal.json` in drizzle/meta
- Modified `.env.example`
- Modified `package.json`
- Modified `tsconfig.cloudflare.json`
- Modified `tsconfig.json`
- Modified `vite.config.ts`

**Documentation:**
- Modified `CHANGELOG.md`

**Other:**
- Added `api.ts` in app/types
- Added `db-middleware.ts` in workers
- Modified `connection.server.ts` in app/lib/db
- Modified `bun.lock`
- Modified `worker-configuration.d.ts`
- Modified `app.ts` in workers
- Modified `types.ts` in workers

**Removed:**
- Removed `memory-bank-instructions.md` from .kilocode/rules
- Removed `brief.md` from .kilocode/rules/memory-bank
- Removed `architect-rules` from .roo/rules-architect
- Removed `ask-rules` from .roo/rules-ask
- Removed `boomerang-rules` from .roo/rules-boomerang
- Removed `code-rules` from .roo/rules-code
- Removed `debug-rules` from .roo/rules-debug
- Removed `test-rules` from .roo/rules-test
- Removed `dev_workflow.md` from .roo/rules
- Removed `roo_rules.md` from .roo/rules
- ...and 4 more files

**Technical Details:**
- Clerk authentication system



## [2025-09-22 18:37:03]

### fix: resolve client-side module bundling errors by separating server/client code

**Changes:**
- Updated api.todos.ts route
- Updated api.users.ts route
- Updated use-supabase-query hook
- New function: action
- New function: useDrizzleServices
- New function: loader
- New function: handleResponse
- Clerk authentication updates
- Drizzle ORM updates

**Frontend Components:**
- Added `api.todos.ts` in app/routes
- Added `api.users.ts` in app/routes
- Modified `use-supabase-query.ts` in app/hooks

**Other:**
- Added `connection.server.ts` in app/lib/db
- Added `todos.server.ts` in app/lib/db
- Added `users.server.ts` in app/lib/db

**Removed:**
- Removed `todos.ts` from app/lib/db
- Removed `users.ts` from app/lib/db



## [2025-09-22 18:34:20]

### fix: resolve client-side module bundling errors by separating server/client code

**Changes:**
- Updated api.todos.ts route
- Updated api.users.ts route
- Updated use-supabase-query hook
- New function: loader
- New function: action
- New function: useDrizzleServices
- New function: handleResponse
- Clerk authentication updates
- Drizzle ORM updates

**Frontend Components:**
- Added `api.todos.ts` in app/routes
- Added `api.users.ts` in app/routes
- Modified `use-supabase-query.ts` in app/hooks

**Other:**
- Added `connection.server.ts` in app/lib/db
- Added `todos.server.ts` in app/lib/db
- Added `users.server.ts` in app/lib/db

**Removed:**
- Removed `todos.ts` from app/lib/db
- Removed `users.ts` from app/lib/db



## [2025-09-22 12:43:24]

### feat: migrate from Convex to Supabase for PostgreSQL support

**Changes:**
- Updated features component
- Updated use-dashboard hook
- Updated use-supabase-query hook
- Updated use-user-management hook
- New function: useUserData
- New function: createClient
- New function: handleSubmit
- New function: useSyncUser
- New function: useCreateTodo
- Convex integration updates
- Clerk authentication updates
- Database schema updates
- Database migrations updates

**Frontend Components:**
- Added `use-supabase-query.ts` in app/hooks
- Added `supabase-provider.tsx` in app/lib
- Modified `user-form.tsx` in app/components/features/admin
- Modified `add-todo-form.tsx` in app/components/features/todos
- Modified `todo-item.tsx` in app/components/features/todos
- Modified `todo-list.tsx` in app/components/features/todos
- Modified `auth-context.tsx` in app/contexts
- Modified `use-dashboard.ts` in app/hooks
- Modified `use-user-management.ts` in app/hooks
- Modified `root.tsx` in app

**Database:**
- Added `database.types.ts` in app/lib
- Added `001_initial_schema.sql` in supabase/migrations
- Added `002_leasepoints_schema.sql` in supabase/migrations

**Configuration:**
- Modified `.env.example`
- Modified `package.json`

**Documentation:**
- Added `CHANGELOG.md`
- Modified `CLAUDE.md`

**Other:**
- Added `todos.ts` in app/lib/db
- Added `users.ts` in app/lib/db
- Added `supabase.ts` in app/lib
- Modified `bun.lock`

**Removed:**
- Removed `convex.tsx` from app/lib
- Removed `README.md` from convex
- Removed `api.d.ts` from convex/_generated
- Removed `api.js` from convex/_generated
- Removed `dataModel.d.ts` from convex/_generated
- Removed `server.d.ts` from convex/_generated
- Removed `server.js` from convex/_generated
- Removed `auth.config.js` from convex
- Removed `auth.ts` from convex
- Removed `http.ts` from convex
- ...and 4 more files

**Renamed:**
- app/hooks/use-clerk-convex-sync.ts → app/hooks/use-clerk-supabase-sync.ts



## [2025-09-22 12:09:45]

### docs: add LeasePoints MVP product requirements document with bun commands

**Changes:**
- New function: generateStatementDescriptor
- New function: createConnectedAccount
- New function: createLeasePayment
- New function: calculateNextRun

**Documentation:**
- Added `PRD.md` in ai_docs


All notable changes to this project will be documented in this file.

