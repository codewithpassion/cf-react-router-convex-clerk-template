# Changelog


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

