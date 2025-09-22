---
allowed-tools: Read, Edit, MultiEdit, Write, Bash(bun check:*), Bash(bun db:*), Bash(git:*), Bash(rm:*), Bash(find:*), Bash(ls:*), TodoWrite
argument-hint: [confirm]
description: Transform Todo app into generic boilerplate by removing all Todo-specific code
---

# 🔄 Transform Todo App to Generic Boilerplate

**Arguments:** `$ARGUMENTS`

## ⚠️ Safety Check

This command transforms the Todo application into a clean, generic boilerplate by removing all Todo-specific functionality while preserving the authentication, admin system, and service architecture.

**To proceed, you must pass "confirm" as an argument:**
```
/transform-to-boilerplate confirm
```

**If you pass any other argument or no argument, this command will only show documentation.**

---

## What This Does

### 🗑️ Removes:
- `todos` database table and migrations
- `TodosService` class
- `/api/todos` API routes
- `/todos` frontend route
- Todo React components (`app/components/features/todos/`)
- Todo hooks and API types
- Todo navigation links and UI references
- Todo-specific permissions

### ✅ Preserves:
- Clerk authentication system
- User management and admin panel
- Role-based permissions (cleaned)
- Database patterns and service examples
- All UI infrastructure
- Build/deployment config

---

## 🚀 Execution (Only if confirmed)

I will automatically execute all transformation steps if you confirmed with "confirm". Otherwise, I'll stop here and only show this documentation.

**Your argument was:** `$ARGUMENTS`

Ready to proceed with the full transformation following the guide in `./ai_docs/todo-to-boilerplate-transformation-guide.md`.