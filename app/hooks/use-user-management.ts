import { useUser } from "@clerk/react-router";
import { useQuery } from "@tanstack/react-query";
import { useFetcher } from "react-router";
import type { Permission, UserRole } from "~/types/auth";
import {
	useSupabaseServices,
	useUserById,
	useUsersList,
} from "./use-supabase-query";

interface RoleInfo {
	name: UserRole;
	level: number;
	label: string;
	description: string;
	permissions: Permission[];
}

interface RoleInfoResponse {
	roles: RoleInfo[];
}

interface UseUsersOptions {
	search?: string;
	role?: UserRole;
	limit?: number;
	offset?: number;
}

interface User {
	id: string;
	name: string;
	email: string;
	image?: string;
	roles: UserRole;
	emailVerified: boolean;
	createdAt: string;
}

interface UsersResponse {
	users: User[];
	totalCount: number;
	hasMore: boolean;
}

interface UserStats {
	totalUsers: number;
	verifiedUsers: number;
	totalAdmins: number;
	totalSuperAdmins: number;
}

// Fetch users from Supabase
export function useUsers(options: UseUsersOptions = {}) {
	const { data, isLoading, error } = useUsersList(options);

	return {
		data: data as UsersResponse | undefined,
		isLoading,
		error: error ? { message: error.message } : null,
	};
}

// Fetch user statistics
export function useUserStats() {
	const { usersService } = useSupabaseServices();
	const { user } = useUser();
	const { data, isLoading, error } = useQuery({
		queryKey: ["user", "admin-stats"],
		queryFn: () => usersService.getUserStats(user?.id || ""),
		enabled: !!user?.id,
	});

	return {
		data: data as UserStats | null,
		isLoading,
		error: error ? { message: error.message } : null,
	};
}

// Static role information
export function useRoleInfo() {
	const roleInfo: RoleInfoResponse = {
		roles: [
			{
				name: "user",
				level: 1,
				label: "User",
				description: "Standard user with basic todo management permissions",
				permissions: ["todos.create_own", "todos.edit_own", "todos.delete_own"],
			},
			{
				name: "admin",
				level: 2,
				label: "Administrator",
				description:
					"Administrator with elevated permissions to manage todos and view all todos",
				permissions: [
					"todos.create_own",
					"todos.edit_own",
					"todos.delete_own",
					"todos.edit_all",
					"todos.view_all",
					"users.view",
					"admin.access",
				],
			},
			{
				name: "superadmin",
				level: 3,
				label: "Super Administrator",
				description:
					"Super administrator with full system access including user and role management",
				permissions: [
					"todos.create_own",
					"todos.edit_own",
					"todos.delete_own",
					"todos.edit_all",
					"todos.view_all",
					"todos.delete_all",
					"users.view",
					"users.create",
					"users.edit",
					"users.delete",
					"users.manage_roles",
					"admin.access",
					"admin.view_stats",
					"admin.manage_settings",
					"system.manage_api",
					"system.manage_security",
				],
			},
		],
	};

	return {
		data: roleInfo,
		isLoading: false,
		error: null as { message: string } | null,
	};
}

// Fetch single user by ID
export function useUserData(id: string, enabled = true) {
	const { data, isLoading, error } = useUserById(id);

	return {
		data: data || null,
		isLoading: isLoading && enabled,
		error: error ? { message: error.message } : null,
	};
}

// Hook for updating user roles via server action
export function useUpdateUser() {
	const fetcher = useFetcher();

	const mutate = (data: { userId: string; roles: UserRole[] }) => {
		const formData = new FormData();
		formData.append("intent", "updateRoles");
		formData.append("userId", data.userId);
		formData.append("roles", JSON.stringify(data.roles));
		fetcher.submit(formData, {
			method: "POST",
			action: "/admin/users/api",
		});
	};

	const mutateAsync = async (data: { userId: string; roles: UserRole[] }) => {
		return new Promise((resolve, reject) => {
			const formData = new FormData();
			formData.append("intent", "updateRoles");
			formData.append("userId", data.userId);
			formData.append("roles", JSON.stringify(data.roles));

			fetcher.submit(formData, {
				method: "POST",
				action: "/admin/users/api",
			});

			// Wait for response
			setTimeout(() => {
				if (fetcher.data?.success) {
					resolve(fetcher.data);
				} else if (fetcher.data?.error) {
					reject(new Error(fetcher.data.error));
				} else {
					reject(new Error("Failed to update user"));
				}
			}, 1000);
		});
	};

	return {
		mutate,
		mutateAsync,
		isLoading: fetcher.state === "submitting",
		isPending: fetcher.state === "submitting",
		error: fetcher.data?.error
			? { message: fetcher.data.error }
			: (null as { message: string } | null),
	};
}

// Hook for assigning roles
export function useAssignRole() {
	const fetcher = useFetcher();

	const mutate = (data: { userId: string; role: UserRole }) => {
		const formData = new FormData();
		formData.append("intent", "addRole");
		formData.append("userId", data.userId);
		formData.append("role", data.role);
		fetcher.submit(formData, {
			method: "POST",
			action: "/admin/users/api",
		});
	};

	const mutateAsync = async (data: { userId: string; role: UserRole }) => {
		return new Promise((resolve, reject) => {
			const formData = new FormData();
			formData.append("intent", "addRole");
			formData.append("userId", data.userId);
			formData.append("role", data.role);

			fetcher.submit(formData, {
				method: "POST",
				action: "/admin/users/api",
			});

			// Wait for response
			setTimeout(() => {
				if (fetcher.data?.success) {
					resolve(fetcher.data);
				} else if (fetcher.data?.error) {
					reject(new Error(fetcher.data.error));
				} else {
					reject(new Error("Failed to assign role"));
				}
			}, 1000);
		});
	};

	return {
		mutate,
		mutateAsync,
		isLoading: fetcher.state === "submitting",
		isPending: fetcher.state === "submitting",
		error: fetcher.data?.error
			? { message: fetcher.data.error }
			: (null as { message: string } | null),
	};
}

// Hook for promoting users
export function usePromoteUser() {
	const fetcher = useFetcher();

	const mutate = (userId: string) => {
		const formData = new FormData();
		formData.append("intent", "promote");
		formData.append("userId", userId);
		fetcher.submit(formData, {
			method: "POST",
			action: "/admin/users/api",
		});
	};

	return {
		mutate,
		isLoading: fetcher.state === "submitting",
		error: fetcher.data?.error
			? { message: fetcher.data.error }
			: (null as { message: string } | null),
	};
}

// Hook for demoting users
export function useDemoteUser() {
	const fetcher = useFetcher();

	const mutate = (userId: string) => {
		const formData = new FormData();
		formData.append("intent", "demote");
		formData.append("userId", userId);
		fetcher.submit(formData, {
			method: "POST",
			action: "/admin/users/api",
		});
	};

	return {
		mutate,
		isLoading: fetcher.state === "submitting",
		error: fetcher.data?.error
			? { message: fetcher.data.error }
			: (null as { message: string } | null),
	};
}

// Note: User creation is handled through Clerk's dashboard
export function useCreateUser() {
	return {
		mutate: () => {},
		mutateAsync: async (_data: unknown) => {
			throw new Error(
				"User creation should be done through Clerk dashboard or signup flow",
			);
		},
		isLoading: false,
		isPending: false,
		error: null as { message: string } | null,
	};
}
