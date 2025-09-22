import { useUser } from "@clerk/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TodosService } from "~/lib/db/todos";
import { UsersService } from "~/lib/db/users";
import { useSupabase } from "~/lib/supabase-provider";

// Hook to get services
export function useSupabaseServices() {
	const { supabase } = useSupabase();
	const usersService = new UsersService(supabase);
	const todosService = new TodosService(supabase);

	return { usersService, todosService };
}

// User hooks
export function useMe() {
	const { user } = useUser();
	const { usersService } = useSupabaseServices();

	return useQuery({
		queryKey: ["user", "me", user?.id],
		queryFn: () => usersService.getMe(user?.id || ""),
		enabled: !!user?.id,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}

export function useUserStats() {
	const { user } = useUser();
	const { usersService } = useSupabaseServices();

	return useQuery({
		queryKey: ["user", "stats", user?.id],
		queryFn: () => usersService.getStats(user?.id || ""),
		enabled: !!user?.id,
		staleTime: 1000 * 60, // 1 minute
	});
}

export function useAdminStats() {
	const { user } = useUser();
	const { usersService } = useSupabaseServices();

	return useQuery({
		queryKey: ["admin", "stats"],
		queryFn: () => usersService.getAdminStats(user?.id || ""),
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
	const { usersService } = useSupabaseServices();

	return useQuery({
		queryKey: ["users", "list", user?.id, options],
		queryFn: () => usersService.listUsers(user?.id || "", options),
		enabled: !!user?.id,
		staleTime: 1000 * 60, // 1 minute
	});
}

export function useUserById(userId: string) {
	const { user } = useUser();
	const { usersService } = useSupabaseServices();

	return useQuery({
		queryKey: ["user", "byId", userId],
		queryFn: () => usersService.getUserById(user?.id || "", userId),
		enabled: !!user?.id && !!userId,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}

// User mutations
export function useSyncUser() {
	const { usersService } = useSupabaseServices();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (userData: {
			clerkId: string;
			email: string;
			name?: string | null;
			imageUrl?: string | null;
			roles?: string[];
		}) => usersService.syncUser(userData),
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
	const { todosService } = useSupabaseServices();

	return useQuery({
		queryKey: ["todos", "list", user?.id],
		queryFn: () => todosService.list(user?.id || ""),
		enabled: !!user?.id,
		staleTime: 1000 * 30, // 30 seconds
	});
}

// Todo mutations
export function useCreateTodo() {
	const { user } = useUser();
	const { todosService } = useSupabaseServices();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (text: string) => todosService.create(user?.id || "", text),
		onSuccess: () => {
			// Invalidate todos list and user stats
			queryClient.invalidateQueries({ queryKey: ["todos", "list", user?.id] });
			queryClient.invalidateQueries({ queryKey: ["user", "stats", user?.id] });
		},
	});
}

export function useUpdateTodo() {
	const { user } = useUser();
	const { todosService } = useSupabaseServices();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			todoId,
			completed,
		}: { todoId: string; completed: boolean }) =>
			todosService.update(user?.id || "", todoId, completed),
		onSuccess: () => {
			// Invalidate todos list and user stats
			queryClient.invalidateQueries({ queryKey: ["todos", "list", user?.id] });
			queryClient.invalidateQueries({ queryKey: ["user", "stats", user?.id] });
		},
	});
}

export function useDeleteTodo() {
	const { user } = useUser();
	const { todosService } = useSupabaseServices();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (todoId: string) => todosService.remove(user?.id || "", todoId),
		onSuccess: () => {
			// Invalidate todos list and user stats
			queryClient.invalidateQueries({ queryKey: ["todos", "list", user?.id] });
			queryClient.invalidateQueries({ queryKey: ["user", "stats", user?.id] });
		},
	});
}
