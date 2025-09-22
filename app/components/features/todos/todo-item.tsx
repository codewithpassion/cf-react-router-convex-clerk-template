import { Trash2 } from "lucide-react";
import React from "react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { useDeleteTodo, useUpdateTodo } from "~/hooks/use-supabase-query";
import type { Database } from "~/lib/database.types";
import { cn } from "~/lib/utils";

type TodoRow = Database["public"]["Tables"]["todos"]["Row"];

export const TodoItem = ({ todo }: { todo: TodoRow }) => {
	const updateTodo = useUpdateTodo();
	const deleteTodo = useDeleteTodo();

	const handleUpdate = (completed: boolean) => {
		updateTodo.mutate({ todoId: todo.id, completed });
	};

	const handleDelete = () => {
		deleteTodo.mutate(todo.id);
	};

	return (
		<div className="group flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
			<Checkbox
				checked={todo.completed}
				onCheckedChange={(checked) => handleUpdate(!!checked)}
				disabled={updateTodo.isPending}
				className="h-5 w-5"
			/>
			<span
				className={cn(
					"flex-1 text-gray-900",
					todo.completed && "line-through text-gray-500",
				)}
			>
				{todo.text}
			</span>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={handleDelete}
				disabled={deleteTodo.isPending}
				className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
			>
				<Trash2 className="h-4 w-4" />
			</Button>
		</div>
	);
};
