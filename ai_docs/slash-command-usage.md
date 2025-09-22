# Slash Command: `/transform-to-boilerplate`

## Overview

I've created a custom slash command that automates the Todo-to-boilerplate transformation process documented in `./ai_docs/todo-to-boilerplate-transformation-guide.md`.

## Command Location

```
.claude/commands/transform-to-boilerplate.md
```

This is a **project-level command**, meaning it's available only in this repository and will be shared with your team.

## Usage

### Show Documentation (Safe)
```bash
/transform-to-boilerplate
```
or
```bash
/transform-to-boilerplate help
```

### Execute Transformation (Destructive)
```bash
/transform-to-boilerplate confirm
```

## Safety Features

1. **Confirmation Required**: The command only executes when you pass "confirm" as an argument
2. **Documentation First**: Any other argument shows documentation instead of running
3. **Tool Permissions**: Limited to specific safe tools with wildcards
4. **Git Integration**: Encourages backup branches before transformation

## What It Does

When confirmed, the command will:

1. **Pre-flight Checks**: Verify git state and create backup recommendations
2. **Database Cleanup**: Remove `todos` table and generate migration
3. **Service Layer**: Remove `TodosService` and clean `UsersService`
4. **API Cleanup**: Remove `/api/todos` route and type definitions
5. **Frontend Cleanup**: Remove Todo components, routes, and hooks
6. **UI References**: Clean navigation, homepage, and admin dashboard
7. **Permissions**: Remove Todo-specific role permissions
8. **Validation**: Run `bun check` to verify everything works
9. **Summary**: Provide transformation summary and next steps

## Architecture Preserved

After transformation, you'll have a clean boilerplate with:
- ✅ Complete Clerk authentication
- ✅ User management admin panel
- ✅ Role-based permissions (cleaned)
- ✅ Database service patterns
- ✅ React Router 7 + Cloudflare Workers
- ✅ TypeScript + Biome + ShadCN UI
- ✅ All development tooling

## Next Steps After Transformation

1. **Verify**: Run `bun check` and `bun dev`
2. **Test**: Ensure authentication and admin features work
3. **Customize**: Add your own features using the preserved patterns
4. **Deploy**: The boilerplate is ready for production deployment

## Example Service Pattern

Use this pattern (copied from TodosService) for new features:

```typescript
export class YourFeatureService {
  constructor(private db: Database) {}

  private async getUserId(clerkId: string): Promise<string | null> {
    // Standard user lookup
  }

  async list(clerkId: string): Promise<YourFeature[]> {
    // List user's items
  }

  async create(clerkId: string, data: NewYourFeature): Promise<YourFeature> {
    // Create with ownership
  }

  async update(clerkId: string, id: string, data: Partial<YourFeature>): Promise<YourFeature> {
    // Update with validation
  }

  async remove(clerkId: string, id: string): Promise<{success: boolean}> {
    // Delete with ownership check
  }
}
```

## Command Availability

The command will appear in `/help` output as:
```
/transform-to-boilerplate [confirm] - Transform Todo app into generic boilerplate by removing all Todo-specific code (project)
```

The "(project)" suffix indicates it's a project-level command stored in this repository.