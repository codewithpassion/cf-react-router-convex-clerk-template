import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { CompetitionForm } from "~/components/features/admin/competition-form";
import { Button } from "~/components/ui/button";
import { useCreateCompetition } from "~/hooks/use-admin";

export default function NewCompetition() {
	const navigate = useNavigate();
	const createMutation = useCreateCompetition();

	const handleSubmit = async (data: any) => {
		try {
			await createMutation.mutateAsync(data);
			navigate("/admin/competitions");
		} catch (error) {
			console.error("Failed to create competition:", error);
		}
	};

	const handleCancel = () => {
		navigate("/admin/competitions");
	};

	return (
		<div className="max-w-6xl mx-auto space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" asChild>
					<Link to="/admin/competitions">
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Competitions
					</Link>
				</Button>
				<div>
					<h1 className="text-2xl font-semibold text-gray-900">
						Create New Competition
					</h1>
					<p className="text-gray-600">Set up a new photo competition</p>
				</div>
			</div>

			<CompetitionForm
				mode="create"
				onSubmit={handleSubmit}
				onCancel={handleCancel}
				isSubmitting={createMutation.isPending}
			/>
		</div>
	);
}
