import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../database.types";

type TodoRow = Database["public"]["Tables"]["todos"]["Row"];
type TodoInsert = Database["public"]["Tables"]["todos"]["Insert"];
type TodoUpdate = Database["public"]["Tables"]["todos"]["Update"];

export class TodosService {
	constructor(private supabase: SupabaseClient<Database>) {}

	private async getUserId(clerkId: string): Promise<string | null> {
		const { data, error } = await this.supabase
			.from("users")
			.select("id")
			.eq("clerk_id", clerkId)
			.single();

		if (error) {
			console.error("Error fetching user ID:", error);
			return null;
		}

		return data.id;
	}

	async list(clerkId: string): Promise<TodoRow[]> {
		const userId = await this.getUserId(clerkId);
		if (!userId) {
			throw new Error("User not found");
		}

		const { data, error } = await this.supabase
			.from("todos")
			.select("*")
			.eq("user_id", userId)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching todos:", error);
			throw new Error("Failed to fetch todos");
		}

		return data || [];
	}

	async create(clerkId: string, text: string): Promise<TodoRow> {
		const userId = await this.getUserId(clerkId);
		if (!userId) {
			throw new Error("User not found");
		}

		const insertData: TodoInsert = {
			user_id: userId,
			text,
			completed: false,
		};

		const { data, error } = await this.supabase
			.from("todos")
			.insert(insertData)
			.select()
			.single();

		if (error) {
			console.error("Error creating todo:", error);
			throw new Error("Failed to create todo");
		}

		return data;
	}

	async update(
		clerkId: string,
		todoId: string,
		completed: boolean,
	): Promise<TodoRow> {
		const userId = await this.getUserId(clerkId);
		if (!userId) {
			throw new Error("User not found");
		}

		// First verify the todo exists and belongs to the user
		const { data: existingTodo, error: fetchError } = await this.supabase
			.from("todos")
			.select("*")
			.eq("id", todoId)
			.eq("user_id", userId)
			.single();

		if (fetchError || !existingTodo) {
			throw new Error("Todo not found or unauthorized");
		}

		const updateData: TodoUpdate = {
			completed,
		};

		const { data, error } = await this.supabase
			.from("todos")
			.update(updateData)
			.eq("id", todoId)
			.eq("user_id", userId)
			.select()
			.single();

		if (error) {
			console.error("Error updating todo:", error);
			throw new Error("Failed to update todo");
		}

		return data;
	}

	async remove(clerkId: string, todoId: string): Promise<{ success: boolean }> {
		const userId = await this.getUserId(clerkId);
		if (!userId) {
			throw new Error("User not found");
		}

		// First verify the todo exists and belongs to the user
		const { data: existingTodo, error: fetchError } = await this.supabase
			.from("todos")
			.select("id")
			.eq("id", todoId)
			.eq("user_id", userId)
			.single();

		if (fetchError || !existingTodo) {
			throw new Error("Todo not found or unauthorized");
		}

		const { error } = await this.supabase
			.from("todos")
			.delete()
			.eq("id", todoId)
			.eq("user_id", userId);

		if (error) {
			console.error("Error deleting todo:", error);
			throw new Error("Failed to delete todo");
		}

		return { success: true };
	}

	async getCompletedCount(clerkId: string): Promise<number> {
		const userId = await this.getUserId(clerkId);
		if (!userId) {
			return 0;
		}

		const { count, error } = await this.supabase
			.from("todos")
			.select("*", { count: "exact", head: true })
			.eq("user_id", userId)
			.eq("completed", true);

		if (error) {
			console.error("Error getting completed todos count:", error);
			return 0;
		}

		return count || 0;
	}

	async getTotalCount(clerkId: string): Promise<number> {
		const userId = await this.getUserId(clerkId);
		if (!userId) {
			return 0;
		}

		const { count, error } = await this.supabase
			.from("todos")
			.select("*", { count: "exact", head: true })
			.eq("user_id", userId);

		if (error) {
			console.error("Error getting total todos count:", error);
			return 0;
		}

		return count || 0;
	}
}
