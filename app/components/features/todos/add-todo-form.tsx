import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useCreateTodo } from "~/hooks/use-supabase-query";

export const AddTodoForm = () => {
	const [text, setText] = useState("");
	const createTodo = useCreateTodo();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (text.trim()) {
			createTodo.mutate(text.trim(), {
				onSuccess: () => {
					setText("");
				},
			});
		}
	};

	return (
		<form onSubmit={handleSubmit} className="flex gap-2">
			<Input
				type="text"
				value={text}
				onChange={(e) => setText(e.target.value)}
				placeholder="Add a new task..."
				disabled={createTodo.isPending}
				className="flex-1"
			/>
			<Button
				type="submit"
				disabled={!text.trim() || createTodo.isPending}
				className="gap-2"
			>
				<Plus className="h-4 w-4" />
				Add Task
			</Button>
		</form>
	);
};
