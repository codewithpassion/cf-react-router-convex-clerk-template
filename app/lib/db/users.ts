import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../database.types";

type UserRow = Database["public"]["Tables"]["users"]["Row"];
type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export class UsersService {
	constructor(private supabase: SupabaseClient<Database>) {}

	async getMe(clerkId: string): Promise<UserRow | null> {
		const { data, error } = await this.supabase
			.from("users")
			.select("*")
			.eq("clerk_id", clerkId)
			.single();

		if (error) {
			console.error("Error fetching user:", error);
			return null;
		}

		return data;
	}

	async syncUser(userData: {
		clerkId: string;
		email: string;
		name?: string | null;
		imageUrl?: string | null;
		roles?: string[];
	}): Promise<string | null> {
		const { clerkId, email, name, imageUrl, roles } = userData;

		// Check if user exists
		const existingUser = await this.getMe(clerkId);

		if (existingUser) {
			// Update existing user
			const updateData: UserUpdate = {
				email,
				name,
				image_url: imageUrl,
				roles: roles || ["user"],
				updated_at: new Date().toISOString(),
			};

			const { error } = await this.supabase
				.from("users")
				.update(updateData)
				.eq("clerk_id", clerkId);

			if (error) {
				console.error("Error updating user:", error);
				return null;
			}

			return existingUser.id;
		}

		// Create new user
		const insertData: UserInsert = {
			clerk_id: clerkId,
			email,
			name,
			image_url: imageUrl,
			roles: roles || ["user"],
		};

		const { data, error } = await this.supabase
			.from("users")
			.insert(insertData)
			.select("id")
			.single();

		if (error) {
			console.error("Error creating user:", error);
			return null;
		}

		return data.id;
	}

	async deleteUser(clerkId: string): Promise<boolean> {
		// First delete all todos for this user
		const user = await this.getMe(clerkId);
		if (!user) {
			return false;
		}

		// Delete todos first (cascade should handle this, but being explicit)
		await this.supabase.from("todos").delete().eq("user_id", user.id);

		// Delete the user
		const { error } = await this.supabase
			.from("users")
			.delete()
			.eq("clerk_id", clerkId);

		if (error) {
			console.error("Error deleting user:", error);
			return false;
		}

		return true;
	}

	async getStats(clerkId: string): Promise<{
		totalTodos: number;
		completedTodos: number;
		pendingTodos: number;
	} | null> {
		const user = await this.getMe(clerkId);
		if (!user) {
			return null;
		}

		const { data: todos, error } = await this.supabase
			.from("todos")
			.select("completed")
			.eq("user_id", user.id);

		if (error) {
			console.error("Error fetching todos for stats:", error);
			return null;
		}

		const completedTodos = todos.filter((todo) => todo.completed).length;

		return {
			totalTodos: todos.length,
			completedTodos,
			pendingTodos: todos.length - completedTodos,
		};
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
		const { data: allTodos, error: todosError } = await this.supabase
			.from("todos")
			.select("completed, created_at");

		if (todosError) {
			console.error("Error fetching todos:", todosError);
			return null;
		}

		const completedTodos = allTodos.filter((todo) => todo.completed).length;

		// Get all users
		const { data: allUsers, error: usersError } = await this.supabase
			.from("users")
			.select("roles");

		if (usersError) {
			console.error("Error fetching users:", usersError);
			return null;
		}

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
		const todayISO = today.toISOString();

		const todaysTodos = allTodos.filter(
			(todo) => new Date(todo.created_at) >= today,
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

		let query = this.supabase.from("users").select("*");

		// Apply search filter
		if (search) {
			query = query.or(`name.ilike.%${search}%, email.ilike.%${search}%`);
		}

		// Apply role filter
		if (role) {
			query = query.contains("roles", [role]);
		}

		// Get total count first
		const { count, error: countError } = await this.supabase
			.from("users")
			.select("*", { count: "exact", head: true });

		if (countError) {
			console.error("Error getting user count:", countError);
			return null;
		}

		// Apply pagination and ordering
		const { data, error } = await query
			.order("created_at", { ascending: false })
			.range(offset, offset + limit - 1);

		if (error) {
			console.error("Error fetching users:", error);
			return null;
		}

		const totalCount = count || 0;
		const hasMore = offset + limit < totalCount;

		const formattedUsers = data.map((user) => ({
			id: user.clerk_id,
			name: user.name || "Unknown",
			email: user.email || "",
			image: user.image_url,
			roles: user.roles[0] || "user",
			emailVerified: true, // Clerk handles email verification
			createdAt: user.created_at,
		}));

		return {
			users: formattedUsers,
			totalCount,
			hasMore,
		};
	}

	async getUserStats(clerkId: string): Promise<{
		totalUsers: number;
		verifiedUsers: number;
		totalAdmins: number;
		totalSuperAdmins: number;
	} | null> {
		// Check if user has admin access
		const currentUser = await this.getMe(clerkId);
		if (
			!currentUser ||
			(!currentUser.roles.includes("admin") &&
				!currentUser.roles.includes("superadmin"))
		) {
			return null;
		}

		const { data: allUsers, error } = await this.supabase
			.from("users")
			.select("roles");

		if (error) {
			console.error("Error fetching users for stats:", error);
			return null;
		}

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
		// Check if user has admin access
		const currentUser = await this.getMe(clerkId);
		if (
			!currentUser ||
			(!currentUser.roles.includes("admin") &&
				!currentUser.roles.includes("superadmin"))
		) {
			throw new Error("Unauthorized: Admin access required");
		}

		const { data: user, error } = await this.supabase
			.from("users")
			.select("*")
			.eq("clerk_id", targetUserId)
			.single();

		if (error) {
			console.error("Error fetching user by ID:", error);
			return null;
		}

		return {
			id: user.clerk_id,
			name: user.name || "Unknown",
			email: user.email || "",
			image: user.image_url,
			roles: user.roles || ["user"],
			createdAt: user.created_at,
		};
	}
}
