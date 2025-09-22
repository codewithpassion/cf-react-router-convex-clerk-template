import type { Todo, User } from "~/lib/db/schema";

// Base response type with index signature
export interface ApiResponse {
	error?: string;
	[key: string]: unknown;
}

// Base response types
export interface ApiErrorResponse extends ApiResponse {
	error: string;
}

// User API response types
export interface UserResponse extends ApiResponse {
	user: User | null;
}

export interface UserStatsResponse extends ApiResponse {
	stats: {
		totalTodos: number;
		completedTodos: number;
		pendingTodos: number;
	} | null;
}

export interface AdminStatsResponse extends ApiResponse {
	stats: {
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
	} | null;
}

export interface UsersListResponse extends ApiResponse {
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
}

export interface UserByIdResponse extends ApiResponse {
	user: {
		id: string;
		name: string;
		email: string;
		image: string | null;
		roles: string[];
		createdAt: string;
	} | null;
}

export interface UserSyncResponse extends ApiResponse {
	user: string | null;
}

// Todo API response types
export interface TodosListResponse extends ApiResponse {
	todos: Todo[];
}

export interface TodoResponse extends ApiResponse {
	todo: Todo;
}

export interface TodoDeleteResponse extends ApiResponse {
	success: boolean;
}

// Union types for all possible API responses
export type UsersApiResponse =
	| UserResponse
	| UserStatsResponse
	| AdminStatsResponse
	| UsersListResponse
	| UserByIdResponse
	| UserSyncResponse
	| ApiErrorResponse;

export type TodosApiResponse =
	| TodosListResponse
	| TodoResponse
	| TodoDeleteResponse
	| ApiErrorResponse;
