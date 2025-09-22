import { getAuth } from "@clerk/react-router/ssr.server";
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	data,
} from "react-router";
import { db } from "~/lib/db/connection.server";
import { TodosService } from "~/lib/db/todos.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
	const { userId: clerkId } = await getAuth({ request, context });

	if (!clerkId) {
		return data({ error: "Unauthorized" }, { status: 401 });
	}

	const todosService = new TodosService(db);
	const todos = await todosService.list(clerkId);
	return data({ todos });
}

export async function action({ request, context }: ActionFunctionArgs) {
	const { userId: clerkId } = await getAuth({ request, context });

	if (!clerkId) {
		return data({ error: "Unauthorized" }, { status: 401 });
	}

	const formData = await request.formData();
	const intent = formData.get("intent");
	const todosService = new TodosService(db);

	switch (intent) {
		case "create": {
			const text = formData.get("text") as string;
			if (!text) {
				return data({ error: "Text is required" }, { status: 400 });
			}
			const todo = await todosService.create(clerkId, text);
			return data({ todo });
		}

		case "update": {
			const todoId = formData.get("todoId") as string;
			const completed = formData.get("completed") === "true";
			if (!todoId) {
				return data({ error: "Todo ID is required" }, { status: 400 });
			}
			const todo = await todosService.update(clerkId, todoId, completed);
			return data({ todo });
		}

		case "delete": {
			const todoId = formData.get("todoId") as string;
			if (!todoId) {
				return data({ error: "Todo ID is required" }, { status: 400 });
			}
			const success = await todosService.remove(clerkId, todoId);
			return data({ success });
		}

		default:
			return data({ error: "Invalid intent" }, { status: 400 });
	}
}
