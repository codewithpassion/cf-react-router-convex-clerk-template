import type { Route } from "+types/api.users";
import { getAuth } from "@clerk/react-router/ssr.server";
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	data,
} from "react-router";
import { UsersService } from "~/lib/db/users.server";
import type {
	AdminStatsResponse,
	ApiErrorResponse,
	UserByIdResponse,
	UserResponse,
	UserStatsResponse,
	UserSyncResponse,
	UsersListResponse,
} from "~/types/api";

export async function loader({ request, context, params }: Route.LoaderArgs) {
	const authResult = await getAuth({ request, context, params });
	const clerkId =
		authResult && "userId" in authResult ? authResult.userId : null;

	if (!clerkId) {
		return data<ApiErrorResponse>({ error: "Unauthorized" }, { status: 401 });
	}

	const url = new URL(request.url);
	const action = url.searchParams.get("action");
	const usersService = new UsersService(context.cloudflare.var.DB);

	switch (action) {
		case "me": {
			const user = await usersService.getMe(clerkId);
			return data<UserResponse>({ user });
		}

		case "stats": {
			const stats = await usersService.getStats(clerkId);
			return data<UserStatsResponse>({ stats });
		}

		case "admin-stats": {
			const stats = await usersService.getAdminStats(clerkId);
			return data<AdminStatsResponse>({ stats });
		}

		case "list": {
			const search = url.searchParams.get("search") || undefined;
			const role = url.searchParams.get("role") || undefined;
			const limit = url.searchParams.get("limit")
				? Number(url.searchParams.get("limit"))
				: undefined;
			const offset = url.searchParams.get("offset")
				? Number(url.searchParams.get("offset"))
				: undefined;

			const result = await usersService.listUsers(clerkId, {
				search,
				role,
				limit,
				offset,
			});
			return data<UsersListResponse | null>(result);
		}

		case "by-id": {
			const targetUserId = url.searchParams.get("userId");
			if (!targetUserId) {
				return data<ApiErrorResponse>(
					{ error: "User ID required" },
					{ status: 400 },
				);
			}
			const user = await usersService.getUserById(clerkId, targetUserId);
			return data<UserByIdResponse>({ user });
		}

		default:
			return data<ApiErrorResponse>(
				{ error: "Invalid action" },
				{ status: 400 },
			);
	}
}

export async function action({ request, context, params }: Route.ActionArgs) {
	const authResult = await getAuth({ request, context, params });
	const clerkId =
		authResult && "userId" in authResult ? authResult.userId : null;

	if (!clerkId) {
		return data<ApiErrorResponse>({ error: "Unauthorized" }, { status: 401 });
	}

	const formData = await request.formData();
	const intent = formData.get("intent");
	const usersService = new UsersService(context.cloudflare.var.DB);

	switch (intent) {
		case "sync": {
			const userData = {
				clerkId: formData.get("clerkId") as string,
				email: formData.get("email") as string,
				name: formData.get("name") as string | null,
				imageUrl: formData.get("imageUrl") as string | null,
				roles: formData.get("roles")
					? JSON.parse(formData.get("roles") as string)
					: undefined,
			};

			const user = await usersService.syncUser(userData);
			return data<UserSyncResponse>({ user });
		}

		default:
			return data<ApiErrorResponse>(
				{ error: "Invalid intent" },
				{ status: 400 },
			);
	}
}
