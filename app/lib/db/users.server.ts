import { and, count, eq, ilike, or, sql } from "drizzle-orm";
import type { Database } from "./connection.server";
import { type NewUser, type User, todos, users } from "./schema";

export class UsersService {
	constructor(private db: Database) {}

	async getMe(clerkId: string): Promise<User | null> {
		try {
			const result = await this.db
				.select()
				.from(users)
				.where(eq(users.clerkId, clerkId))
				.limit(1);

			return result[0] || null;
		} catch (error) {
			console.error("Error fetching user:", error);
			return null;
		}
	}

	async syncUser(userData: {
		clerkId: string;
		email: string;
		name?: string | null;
		imageUrl?: string | null;
		roles?: string[];
	}): Promise<string | null> {
		const { clerkId, email, name, imageUrl, roles } = userData;

		try {
			// Check if user exists
			const existingUser = await this.getMe(clerkId);

			if (existingUser) {
				// Update existing user
				await this.db
					.update(users)
					.set({
						email,
						name,
						imageUrl,
						roles: roles || ["user"],
						updatedAt: new Date(),
					})
					.where(eq(users.clerkId, clerkId));

				return existingUser.id;
			}

			// Create new user
			const insertData: NewUser = {
				clerkId,
				email,
				name,
				imageUrl,
				roles: roles || ["user"],
			};

			const result = await this.db
				.insert(users)
				.values(insertData)
				.returning({ id: users.id });

			return result[0]?.id || null;
		} catch (error) {
			console.error("Error syncing user:", error);
			return null;
		}
	}

	async deleteUser(clerkId: string): Promise<boolean> {
		try {
			// First delete all todos for this user
			const user = await this.getMe(clerkId);
			if (!user) {
				return false;
			}

			// Delete todos first (cascade should handle this, but being explicit)
			await this.db.delete(todos).where(eq(todos.userId, user.id));

			// Delete the user
			await this.db.delete(users).where(eq(users.clerkId, clerkId));

			return true;
		} catch (error) {
			console.error("Error deleting user:", error);
			return false;
		}
	}

	async getStats(clerkId: string): Promise<{
		totalTodos: number;
		completedTodos: number;
		pendingTodos: number;
	} | null> {
		try {
			const user = await this.getMe(clerkId);
			if (!user) {
				return null;
			}

			const userTodos = await this.db
				.select({ completed: todos.completed })
				.from(todos)
				.where(eq(todos.userId, user.id));

			const completedTodos = userTodos.filter((todo) => todo.completed).length;

			return {
				totalTodos: userTodos.length,
				completedTodos,
				pendingTodos: userTodos.length - completedTodos,
			};
		} catch (error) {
			console.error("Error fetching todos for stats:", error);
			return null;
		}
	}

	async getAdminStats(clerkId: string): Promise<{
		todos: {
			total: number;
			completed: number;
			pending: number;
		};
		users: {
			total: number;
			admins: number;
			superAdmins: number;
		};
		today: {
			newTodos: number;
			completedTodos: number;
		};
	} | null> {
		try {
			// Check if user is admin
			const currentUser = await this.getMe(clerkId);
			if (
				!currentUser ||
				(!currentUser.roles.includes("admin") &&
					!currentUser.roles.includes("superadmin"))
			) {
				throw new Error("Unauthorized: Admin access required");
			}

			// Get all todos
			const allTodos = await this.db
				.select({
					completed: todos.completed,
					createdAt: todos.createdAt,
				})
				.from(todos);

			const completedTodos = allTodos.filter((todo) => todo.completed).length;

			// Get all users
			const allUsers = await this.db.select({ roles: users.roles }).from(users);

			const adminUsers = allUsers.filter(
				(user) =>
					user.roles.includes("admin") && !user.roles.includes("superadmin"),
			).length;
			const superAdminUsers = allUsers.filter((user) =>
				user.roles.includes("superadmin"),
			).length;

			// Get today's stats
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			const todaysTodos = allTodos.filter(
				(todo) => new Date(todo.createdAt) >= today,
			);
			const todaysCompletedTodos = todaysTodos.filter(
				(todo) => todo.completed,
			).length;

			return {
				todos: {
					total: allTodos.length,
					completed: completedTodos,
					pending: allTodos.length - completedTodos,
				},
				users: {
					total: allUsers.length,
					admins: adminUsers,
					superAdmins: superAdminUsers,
				},
				today: {
					newTodos: todaysTodos.length,
					completedTodos: todaysCompletedTodos,
				},
			};
		} catch (error) {
			console.error("Error fetching admin stats:", error);
			return null;
		}
	}

	async listUsers(
		clerkId: string,
		options: {
			search?: string;
			role?: string;
			limit?: number;
			offset?: number;
		} = {},
	): Promise<{
		users: Array<{
			id: string;
			name: string;
			email: string;
			image: string | null;
			roles: string;
			emailVerified: boolean;
			createdAt: string;
		}>;
		totalCount: number;
		hasMore: boolean;
	} | null> {
		try {
			// Check if user has admin access
			const currentUser = await this.getMe(clerkId);
			if (
				!currentUser ||
				(!currentUser.roles.includes("admin") &&
					!currentUser.roles.includes("superadmin"))
			) {
				throw new Error("Unauthorized: Admin access required");
			}

			const { search, role, limit = 20, offset = 0 } = options;

			// Build the where conditions
			const conditions = [];

			// Apply search filter
			if (search) {
				conditions.push(
					or(
						ilike(users.name, `%${search}%`),
						ilike(users.email, `%${search}%`),
					),
				);
			}

			// Apply role filter
			if (role) {
				conditions.push(sql`${users.roles} @> ARRAY[${role}]`);
			}

			const whereClause =
				conditions.length > 0 ? and(...conditions) : undefined;

			// Get total count first
			const [totalResult] = await this.db
				.select({ count: count() })
				.from(users)
				.where(whereClause);

			const totalCount = totalResult?.count || 0;

			// Apply pagination and ordering
			const data = await this.db
				.select()
				.from(users)
				.where(whereClause)
				.orderBy(sql`${users.createdAt} DESC`)
				.limit(limit)
				.offset(offset);

			const hasMore = offset + limit < totalCount;

			const formattedUsers = data.map((user) => ({
				id: user.clerkId,
				name: user.name || "Unknown",
				email: user.email || "",
				image: user.imageUrl,
				roles: user.roles[0] || "user",
				emailVerified: true, // Clerk handles email verification
				createdAt: user.createdAt.toISOString(),
			}));

			return {
				users: formattedUsers,
				totalCount,
				hasMore,
			};
		} catch (error) {
			console.error("Error fetching users:", error);
			return null;
		}
	}

	async getUserStats(clerkId: string): Promise<{
		totalUsers: number;
		verifiedUsers: number;
		totalAdmins: number;
		totalSuperAdmins: number;
	} | null> {
		try {
			// Check if user has admin access
			const currentUser = await this.getMe(clerkId);
			if (
				!currentUser ||
				(!currentUser.roles.includes("admin") &&
					!currentUser.roles.includes("superadmin"))
			) {
				return null;
			}

			const allUsers = await this.db.select({ roles: users.roles }).from(users);

			const totalAdmins = allUsers.filter(
				(user) =>
					user.roles.includes("admin") && !user.roles.includes("superadmin"),
			).length;
			const totalSuperAdmins = allUsers.filter((user) =>
				user.roles.includes("superadmin"),
			).length;

			return {
				totalUsers: allUsers.length,
				verifiedUsers: allUsers.length, // All Clerk users are verified
				totalAdmins,
				totalSuperAdmins,
			};
		} catch (error) {
			console.error("Error fetching users for stats:", error);
			return null;
		}
	}

	async getUserById(
		clerkId: string,
		targetUserId: string,
	): Promise<{
		id: string;
		name: string;
		email: string;
		image: string | null;
		roles: string[];
		createdAt: string;
	} | null> {
		try {
			// Check if user has admin access
			const currentUser = await this.getMe(clerkId);
			if (
				!currentUser ||
				(!currentUser.roles.includes("admin") &&
					!currentUser.roles.includes("superadmin"))
			) {
				throw new Error("Unauthorized: Admin access required");
			}

			const result = await this.db
				.select()
				.from(users)
				.where(eq(users.clerkId, targetUserId))
				.limit(1);

			const user = result[0];
			if (!user) {
				return null;
			}

			return {
				id: user.clerkId,
				name: user.name || "Unknown",
				email: user.email || "",
				image: user.imageUrl,
				roles: user.roles || ["user"],
				createdAt: user.createdAt.toISOString(),
			};
		} catch (error) {
			console.error("Error fetching user by ID:", error);
			return null;
		}
	}
}
