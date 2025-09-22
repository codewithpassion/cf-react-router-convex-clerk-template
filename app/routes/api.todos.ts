import type { Route } from "+types/api.todos";
import { getAuth } from "@clerk/react-router/ssr.server";
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	data,
} from "react-router";
import { TodosService } from "~/lib/db/todos.server";
import type {
	ApiErrorResponse,
	TodoDeleteResponse,
	TodoResponse,
	TodosListResponse,
} from "~/types/api";

export async function loader({ request, context, params }: Route.LoaderArgs) {
	const authResult = await getAuth({ request, context, params });
	const clerkId =
		authResult && "userId" in authResult ? authResult.userId : null;

	if (!clerkId) {
		return data<ApiErrorResponse>({ error: "Unauthorized" }, { status: 401 });
	}

	const todosService = new TodosService(context.cloudflare.var.DB);
	const todos = await todosService.list(clerkId);
	return data<TodosListResponse>({ todos });
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
	const todosService = new TodosService(context.cloudflare.var.DB);

	switch (intent) {
		case "create": {
			const text = formData.get("text") as string;
			if (!text) {
				return data<ApiErrorResponse>(
					{ error: "Text is required" },
					{ status: 400 },
				);
			}
			const todo = await todosService.create(clerkId, text);
			return data<TodoResponse>({ todo });
		}

		case "update": {
			const todoId = formData.get("todoId") as string;
			const completed = formData.get("completed") === "true";
			if (!todoId) {
				return data<ApiErrorResponse>(
					{ error: "Todo ID is required" },
					{ status: 400 },
				);
			}
			const todo = await todosService.update(clerkId, todoId, completed);
			return data<TodoResponse>({ todo });
		}

		case "delete": {
			const todoId = formData.get("todoId") as string;
			if (!todoId) {
				return data<ApiErrorResponse>(
					{ error: "Todo ID is required" },
					{ status: 400 },
				);
			}
			const success = await todosService.remove(clerkId, todoId);
			return data<TodoDeleteResponse>(success);
		}

		default:
			return data<ApiErrorResponse>(
				{ error: "Invalid intent" },
				{ status: 400 },
			);
	}
}
