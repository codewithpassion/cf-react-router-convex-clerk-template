import { useUser } from "@clerk/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Helper function to handle API responses
async function handleResponse(response: Response) {
	const json = await response.json();
	if (!response.ok) {
		throw new Error(json.error || "API request failed");
	}
	return json;
}

// User hooks
export function useMe() {
	const { user } = useUser();

	return useQuery({
		queryKey: ["user", "me", user?.id],
		queryFn: async () => {
			const response = await fetch("/api/users?action=me");
			const data = await handleResponse(response);
			return data.user;
		},
		enabled: !!user?.id,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}

export function useUserStats() {
	const { user } = useUser();

	return useQuery({
		queryKey: ["user", "stats", user?.id],
		queryFn: async () => {
			const response = await fetch("/api/users?action=stats");
			const data = await handleResponse(response);
			return data.stats;
		},
		enabled: !!user?.id,
		staleTime: 1000 * 60, // 1 minute
	});
}

export function useAdminStats() {
	const { user } = useUser();

	return useQuery({
		queryKey: ["admin", "stats"],
		queryFn: async () => {
			const response = await fetch("/api/users?action=admin-stats");
			const data = await handleResponse(response);
			return data.stats;
		},
		enabled: !!user?.id,
		staleTime: 1000 * 60, // 1 minute
	});
}

export function useUsersList(
	options: {
		search?: string;
		role?: string;
		limit?: number;
		offset?: number;
	} = {},
) {
	const { user } = useUser();

	return useQuery({
		queryKey: ["users", "list", user?.id, options],
		queryFn: async () => {
			const params = new URLSearchParams({
				action: "list",
				...(options.search && { search: options.search }),
				...(options.role && { role: options.role }),
				...(options.limit && { limit: options.limit.toString() }),
				...(options.offset && { offset: options.offset.toString() }),
			});
			const response = await fetch(`/api/users?${params}`);
			return handleResponse(response);
		},
		enabled: !!user?.id,
		staleTime: 1000 * 60, // 1 minute
	});
}

export function useUserById(userId: string) {
	const { user } = useUser();

	return useQuery({
		queryKey: ["user", "byId", userId],
		queryFn: async () => {
			const response = await fetch(`/api/users?action=by-id&userId=${userId}`);
			const data = await handleResponse(response);
			return data.user;
		},
		enabled: !!user?.id && !!userId,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}

// User mutations
export function useSyncUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (userData: {
			clerkId: string;
			email: string;
			name?: string | null;
			imageUrl?: string | null;
			roles?: string[];
		}) => {
			const formData = new FormData();
			formData.append("intent", "sync");
			formData.append("clerkId", userData.clerkId);
			formData.append("email", userData.email);
			if (userData.name) formData.append("name", userData.name);
			if (userData.imageUrl) formData.append("imageUrl", userData.imageUrl);
			if (userData.roles)
				formData.append("roles", JSON.stringify(userData.roles));

			const response = await fetch("/api/users", {
				method: "POST",
				body: formData,
			});
			const data = await handleResponse(response);
			return data.user;
		},
		onSuccess: (data, variables) => {
			// Invalidate and refetch user data
			queryClient.invalidateQueries({
				queryKey: ["user", "me", variables.clerkId],
			});
		},
	});
}

// Todo hooks
export function useTodos() {
	const { user } = useUser();

	return useQuery({
		queryKey: ["todos", "list", user?.id],
		queryFn: async () => {
			const response = await fetch("/api/todos");
			const data = await handleResponse(response);
			return data.todos;
		},
		enabled: !!user?.id,
		staleTime: 1000 * 30, // 30 seconds
	});
}

// Todo mutations
export function useCreateTodo() {
	const { user } = useUser();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (text: string) => {
			const formData = new FormData();
			formData.append("intent", "create");
			formData.append("text", text);

			const response = await fetch("/api/todos", {
				method: "POST",
				body: formData,
			});
			const data = await handleResponse(response);
			return data.todo;
		},
		onSuccess: () => {
			// Invalidate todos list and user stats
			queryClient.invalidateQueries({ queryKey: ["todos", "list", user?.id] });
			queryClient.invalidateQueries({ queryKey: ["user", "stats", user?.id] });
		},
	});
}

export function useUpdateTodo() {
	const { user } = useUser();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			todoId,
			completed,
		}: { todoId: string; completed: boolean }) => {
			const formData = new FormData();
			formData.append("intent", "update");
			formData.append("todoId", todoId);
			formData.append("completed", completed.toString());

			const response = await fetch("/api/todos", {
				method: "POST",
				body: formData,
			});
			const data = await handleResponse(response);
			return data.todo;
		},
		onSuccess: () => {
			// Invalidate todos list and user stats
			queryClient.invalidateQueries({ queryKey: ["todos", "list", user?.id] });
			queryClient.invalidateQueries({ queryKey: ["user", "stats", user?.id] });
		},
	});
}

export function useDeleteTodo() {
	const { user } = useUser();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (todoId: string) => {
			const formData = new FormData();
			formData.append("intent", "delete");
			formData.append("todoId", todoId);

			const response = await fetch("/api/todos", {
				method: "POST",
				body: formData,
			});
			const data = await handleResponse(response);
			return data.success;
		},
		onSuccess: () => {
			// Invalidate todos list and user stats
			queryClient.invalidateQueries({ queryKey: ["todos", "list", user?.id] });
			queryClient.invalidateQueries({ queryKey: ["user", "stats", user?.id] });
		},
	});
}

// Keep the old names for backward compatibility
export const useDrizzleServices = () => {
	console.warn(
		"useDrizzleServices is deprecated. Use individual hooks instead.",
	);
	return {};
};

export const useSupabaseServices = useDrizzleServices;
