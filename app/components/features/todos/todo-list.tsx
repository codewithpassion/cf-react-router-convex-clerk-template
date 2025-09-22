import { LoadingSpinner } from "~/components/ui/loading-spinner";
import { useTodos } from "~/hooks/use-supabase-query";
import { AddTodoForm } from "./add-todo-form";
import { TodoItem } from "./todo-item";

export const TodoList = () => {
	const { data: todos, isLoading, error } = useTodos();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<LoadingSpinner size="lg" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center py-8 text-red-600">
				Error loading todos. Please try again.
			</div>
		);
	}

	const completedCount = todos?.filter((todo) => todo.completed).length || 0;
	const totalCount = todos?.length || 0;

	return (
		<div className="space-y-6">
			<AddTodoForm />

			{/* Stats */}
			{totalCount > 0 && (
				<div className="text-sm text-gray-600 px-1">
					{completedCount} of {totalCount} completed
				</div>
			)}

			{/* Todo Items */}
			<div className="space-y-2">
				{todos?.length === 0 ? (
					<div className="text-center py-12">
						<p className="text-gray-500">
							No tasks yet. Add one above to get started!
						</p>
					</div>
				) : (
					todos?.map((todo) => <TodoItem key={todo.id} todo={todo} />)
				)}
			</div>
		</div>
	);
};
