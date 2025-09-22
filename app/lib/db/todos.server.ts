import { and, count, eq } from "drizzle-orm";
import type { Database } from "./connection.server";
import { type NewTodo, type Todo, todos, users } from "./schema";

export class TodosService {
	constructor(private db: Database) {}

	private async getUserId(clerkId: string): Promise<string | null> {
		try {
			const result = await this.db
				.select({ id: users.id })
				.from(users)
				.where(eq(users.clerkId, clerkId))
				.limit(1);

			return result[0]?.id || null;
		} catch (error) {
			console.error("Error fetching user ID:", error);
			return null;
		}
	}

	async list(clerkId: string): Promise<Todo[]> {
		try {
			const userId = await this.getUserId(clerkId);
			if (!userId) {
				throw new Error("User not found");
			}

			const data = await this.db
				.select()
				.from(todos)
				.where(eq(todos.userId, userId))
				.orderBy(todos.createdAt);

			return data;
		} catch (error) {
			console.error("Error fetching todos:", error);
			throw new Error("Failed to fetch todos");
		}
	}

	async create(clerkId: string, text: string): Promise<Todo> {
		try {
			const userId = await this.getUserId(clerkId);
			if (!userId) {
				throw new Error("User not found");
			}

			const insertData: NewTodo = {
				userId,
				text,
				completed: false,
			};

			const result = await this.db.insert(todos).values(insertData).returning();

			return result[0];
		} catch (error) {
			console.error("Error creating todo:", error);
			throw new Error("Failed to create todo");
		}
	}

	async update(
		clerkId: string,
		todoId: string,
		completed: boolean,
	): Promise<Todo> {
		try {
			const userId = await this.getUserId(clerkId);
			if (!userId) {
				throw new Error("User not found");
			}

			// First verify the todo exists and belongs to the user
			const existingTodo = await this.db
				.select()
				.from(todos)
				.where(and(eq(todos.id, todoId), eq(todos.userId, userId)))
				.limit(1);

			if (!existingTodo[0]) {
				throw new Error("Todo not found or unauthorized");
			}

			const result = await this.db
				.update(todos)
				.set({ completed })
				.where(and(eq(todos.id, todoId), eq(todos.userId, userId)))
				.returning();

			if (!result[0]) {
				throw new Error("Failed to update todo");
			}

			return result[0];
		} catch (error) {
			console.error("Error updating todo:", error);
			throw new Error("Failed to update todo");
		}
	}

	async remove(clerkId: string, todoId: string): Promise<{ success: boolean }> {
		try {
			const userId = await this.getUserId(clerkId);
			if (!userId) {
				throw new Error("User not found");
			}

			// First verify the todo exists and belongs to the user
			const existingTodo = await this.db
				.select({ id: todos.id })
				.from(todos)
				.where(and(eq(todos.id, todoId), eq(todos.userId, userId)))
				.limit(1);

			if (!existingTodo[0]) {
				throw new Error("Todo not found or unauthorized");
			}

			await this.db
				.delete(todos)
				.where(and(eq(todos.id, todoId), eq(todos.userId, userId)));

			return { success: true };
		} catch (error) {
			console.error("Error deleting todo:", error);
			throw new Error("Failed to delete todo");
		}
	}

	async getCompletedCount(clerkId: string): Promise<number> {
		try {
			const userId = await this.getUserId(clerkId);
			if (!userId) {
				return 0;
			}

			const result = await this.db
				.select({ count: count() })
				.from(todos)
				.where(and(eq(todos.userId, userId), eq(todos.completed, true)));

			return result[0]?.count || 0;
		} catch (error) {
			console.error("Error getting completed todos count:", error);
			return 0;
		}
	}

	async getTotalCount(clerkId: string): Promise<number> {
		try {
			const userId = await this.getUserId(clerkId);
			if (!userId) {
				return 0;
			}

			const result = await this.db
				.select({ count: count() })
				.from(todos)
				.where(eq(todos.userId, userId));

			return result[0]?.count || 0;
		} catch (error) {
			console.error("Error getting total todos count:", error);
			return 0;
		}
	}
}
