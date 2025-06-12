import { format } from "date-fns";
import {
	Calendar,
	Copy,
	Edit,
	Eye,
	Filter,
	Grid,
	List,
	MoreHorizontal,
	Plus,
	Search,
	Trash2,
	Trophy,
	Users,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { CompetitionCard } from "~/components/features/competitions/competition-card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { StatusBadge } from "~/components/ui/status-badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import {
	useAllCompetitions,
	useBulkActions,
	useBulkUpdateCompetitions,
	useDeleteCompetition,
} from "~/hooks/use-admin";

interface CompetitionFiltersProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	filterStatus: string;
	onStatusChange: (value: string) => void;
	sortBy: string;
	onSortChange: (value: string) => void;
	viewMode: "grid" | "table";
	onViewModeChange: (mode: "grid" | "table") => void;
}

function CompetitionFilters({
	searchQuery,
	onSearchChange,
	filterStatus,
	onStatusChange,
	sortBy,
	onSortChange,
	viewMode,
	onViewModeChange,
}: CompetitionFiltersProps) {
	return (
		<Card>
			<CardContent className="p-6">
				<div className="flex flex-col sm:flex-row gap-4">
					<div className="flex-1">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
							<Input
								placeholder="Search competitions..."
								value={searchQuery}
								onChange={(e) => onSearchChange(e.target.value)}
								className="pl-10"
							/>
						</div>
					</div>
					<div className="flex gap-2">
						<Select value={filterStatus} onValueChange={onStatusChange}>
							<SelectTrigger className="w-40">
								<Filter className="w-4 h-4 mr-2" />
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="draft">Draft</SelectItem>
								<SelectItem value="open">Open</SelectItem>
								<SelectItem value="voting">Voting</SelectItem>
								<SelectItem value="closed">Closed</SelectItem>
							</SelectContent>
						</Select>
						<Select value={sortBy} onValueChange={onSortChange}>
							<SelectTrigger className="w-40">
								<SelectValue placeholder="Sort by" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="date">Created Date</SelectItem>
								<SelectItem value="title">Title</SelectItem>
								<SelectItem value="status">Status</SelectItem>
								<SelectItem value="submissions">Submissions</SelectItem>
							</SelectContent>
						</Select>
						<div className="flex border rounded-md">
							<Button
								variant={viewMode === "grid" ? "default" : "ghost"}
								size="sm"
								onClick={() => onViewModeChange("grid")}
								className="rounded-r-none"
							>
								<Grid className="w-4 h-4" />
							</Button>
							<Button
								variant={viewMode === "table" ? "default" : "ghost"}
								size="sm"
								onClick={() => onViewModeChange("table")}
								className="rounded-l-none"
							>
								<List className="w-4 h-4" />
							</Button>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

interface CompetitionTableProps {
	competitions?: any[];
	selectedCompetitions: string[];
	onSelectionChange: (selected: string[]) => void;
	onEdit: (id: string) => void;
	onDuplicate: (id: string) => void;
	onDelete: (id: string) => void;
	isLoading: boolean;
}

function CompetitionTable({
	competitions = [],
	selectedCompetitions,
	onSelectionChange,
	onEdit,
	onDuplicate,
	onDelete,
	isLoading,
}: CompetitionTableProps) {
	const { toggleItem, toggleAll, isSelected } = useBulkActions();

	if (isLoading) {
		return (
			<Card>
				<CardContent className="p-6">
					<div className="space-y-4">
						{[1, 2, 3, 4, 5].map((i) => (
							<div key={i} className="flex items-center space-x-4">
								<div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
								<div className="flex-1 space-y-2">
									<div className="h-4 bg-gray-200 rounded animate-pulse" />
									<div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
								</div>
								<div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
								<div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-12">
							<Checkbox
								checked={
									selectedCompetitions.length === competitions.length &&
									competitions.length > 0
								}
								onCheckedChange={() => toggleAll(competitions)}
							/>
						</TableHead>
						<TableHead>Competition</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Dates</TableHead>
						<TableHead>Stats</TableHead>
						<TableHead className="w-12"></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{competitions.length === 0 ? (
						<TableRow>
							<TableCell colSpan={6} className="text-center py-8">
								<div className="flex flex-col items-center gap-2">
									<Trophy className="w-12 h-12 text-gray-400" />
									<p className="text-gray-500">No competitions found</p>
									<Button asChild>
										<Link to="/admin/competitions/new">
											<Plus className="w-4 h-4 mr-2" />
											Create Competition
										</Link>
									</Button>
								</div>
							</TableCell>
						</TableRow>
					) : (
						competitions.map((competition) => (
							<TableRow key={competition.id}>
								<TableCell>
									<Checkbox
										checked={isSelected(competition.id)}
										onCheckedChange={() => toggleItem(competition.id)}
									/>
								</TableCell>
								<TableCell>
									<div className="space-y-1">
										<div className="font-medium">{competition.title}</div>
										<div className="text-sm text-gray-500 line-clamp-2">
											{competition.description}
										</div>
									</div>
								</TableCell>
								<TableCell>
									<StatusBadge
										status={competition.status}
										variant={
											competition.status === "open"
												? "success"
												: competition.status === "voting"
													? "info"
													: competition.status === "closed"
														? "secondary"
														: "default"
										}
									/>
								</TableCell>
								<TableCell>
									<div className="space-y-1 text-sm">
										<div className="flex items-center gap-1">
											<Calendar className="w-3 h-3 text-gray-400" />
											<span>
												{competition.startDate
													? format(
															new Date(competition.startDate),
															"MMM dd, yyyy",
														)
													: "Not set"}
											</span>
										</div>
										{competition.endDate && (
											<div className="text-gray-500">
												to{" "}
												{format(new Date(competition.endDate), "MMM dd, yyyy")}
											</div>
										)}
									</div>
								</TableCell>
								<TableCell>
									<div className="space-y-1 text-sm">
										<div className="flex items-center gap-1">
											<Users className="w-3 h-3 text-gray-400" />
											<span>
												{competition._count?.submissions || 0} submissions
											</span>
										</div>
										<div className="flex items-center gap-1">
											<Trophy className="w-3 h-3 text-gray-400" />
											<span>{competition._count?.votes || 0} votes</span>
										</div>
									</div>
								</TableCell>
								<TableCell>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="sm">
												<MoreHorizontal className="w-4 h-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem asChild>
												<Link to={`/competitions/${competition.id}`}>
													<Eye className="w-4 h-4 mr-2" />
													View
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => onEdit(competition.id)}>
												<Edit className="w-4 h-4 mr-2" />
												Edit
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => onDuplicate(competition.id)}
											>
												<Copy className="w-4 h-4 mr-2" />
												Duplicate
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												onClick={() => onDelete(competition.id)}
												className="text-red-600"
											>
												<Trash2 className="w-4 h-4 mr-2" />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</Card>
	);
}

interface CompetitionGridProps {
	competitions?: any[];
	selectedCompetitions: string[];
	onSelectionChange: (selected: string[]) => void;
	onEdit: (id: string) => void;
	onDuplicate: (id: string) => void;
	onDelete: (id: string) => void;
	isLoading: boolean;
}

function CompetitionGrid({
	competitions = [],
	onEdit,
	onDuplicate,
	onDelete,
	isLoading,
}: CompetitionGridProps) {
	if (isLoading) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<Card key={i} className="animate-pulse">
						<CardContent className="p-6">
							<div className="space-y-4">
								<div className="h-4 bg-gray-200 rounded" />
								<div className="h-3 bg-gray-200 rounded w-2/3" />
								<div className="h-3 bg-gray-200 rounded w-1/2" />
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{competitions.length === 0 ? (
				<div className="col-span-full text-center py-12">
					<div className="flex flex-col items-center gap-4">
						<Trophy className="w-16 h-16 text-gray-400" />
						<div>
							<h3 className="text-lg font-medium text-gray-900">
								No competitions found
							</h3>
							<p className="text-gray-500">
								Create your first competition to get started
							</p>
						</div>
						<Button asChild>
							<Link to="/admin/competitions/new">
								<Plus className="w-4 h-4 mr-2" />
								Create Competition
							</Link>
						</Button>
					</div>
				</div>
			) : (
				competitions.map((competition) => (
					<CompetitionCard
						key={competition.id}
						competition={competition}
						showActions={true}
						onEdit={onEdit}
						onDelete={onDelete}
						onClick={() => {}}
					/>
				))
			)}
		</div>
	);
}

interface BulkCompetitionActionsProps {
	selectedCount: number;
	onBulkStatusUpdate: (status: string) => void;
	onBulkDelete: () => void;
	onClearSelection: () => void;
}

function BulkCompetitionActions({
	selectedCount,
	onBulkStatusUpdate,
	onBulkDelete,
	onClearSelection,
}: BulkCompetitionActionsProps) {
	return (
		<Card className="border-blue-200 bg-blue-50">
			<CardContent className="p-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<span className="text-sm font-medium">
							{selectedCount} competition{selectedCount !== 1 ? "s" : ""}{" "}
							selected
						</span>
						<div className="flex gap-2">
							<Select onValueChange={onBulkStatusUpdate}>
								<SelectTrigger className="w-40">
									<SelectValue placeholder="Change Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="draft">Set to Draft</SelectItem>
									<SelectItem value="open">Set to Open</SelectItem>
									<SelectItem value="voting">Set to Voting</SelectItem>
									<SelectItem value="closed">Set to Closed</SelectItem>
								</SelectContent>
							</Select>
							<Button variant="destructive" size="sm" onClick={onBulkDelete}>
								<Trash2 className="w-4 h-4 mr-2" />
								Delete Selected
							</Button>
						</div>
					</div>
					<Button variant="ghost" size="sm" onClick={onClearSelection}>
						Clear Selection
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

export default function AdminCompetitions() {
	const navigate = useNavigate();
	const [selectedCompetitions, setSelectedCompetitions] = useState<string[]>(
		[],
	);
	const [filterStatus, setFilterStatus] = useState<string>("all");
	const [sortBy, setSortBy] = useState<string>("date");
	const [searchQuery, setSearchQuery] = useState("");
	const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

	const { data: competitions, isLoading } = useAllCompetitions({
		status: filterStatus === "all" ? undefined : filterStatus,
		sort: sortBy,
		search: searchQuery,
	});

	const deleteMutation = useDeleteCompetition();
	const bulkUpdateMutation = useBulkUpdateCompetitions();

	const handleEdit = (id: string) => {
		navigate(`/admin/competitions/${id}/edit`);
	};

	const handleDuplicate = async (id: string) => {
		// Implementation for duplicating competition
		console.log("Duplicate competition:", id);
	};

	const handleDelete = async (id: string) => {
		if (confirm("Are you sure you want to delete this competition?")) {
			await deleteMutation.mutateAsync(id);
		}
	};

	const handleBulkStatusUpdate = async (status: string) => {
		await bulkUpdateMutation.mutateAsync({
			ids: selectedCompetitions,
			updates: { status },
		});
		setSelectedCompetitions([]);
	};

	const handleBulkDelete = async () => {
		if (
			confirm(
				`Are you sure you want to delete ${selectedCompetitions.length} competitions?`,
			)
		) {
			await bulkUpdateMutation.mutateAsync({
				ids: selectedCompetitions,
				action: "delete",
			});
			setSelectedCompetitions([]);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-semibold">Competition Management</h1>
					<p className="text-gray-600">Create and manage photo competitions</p>
				</div>
				<Button asChild>
					<Link to="/admin/competitions/new">
						<Plus className="w-4 h-4 mr-2" />
						Create Competition
					</Link>
				</Button>
			</div>

			<CompetitionFilters
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				filterStatus={filterStatus}
				onStatusChange={setFilterStatus}
				sortBy={sortBy}
				onSortChange={setSortBy}
				viewMode={viewMode}
				onViewModeChange={setViewMode}
			/>

			{viewMode === "table" ? (
				<CompetitionTable
					competitions={competitions}
					selectedCompetitions={selectedCompetitions}
					onSelectionChange={setSelectedCompetitions}
					onEdit={handleEdit}
					onDuplicate={handleDuplicate}
					onDelete={handleDelete}
					isLoading={isLoading}
				/>
			) : (
				<CompetitionGrid
					competitions={competitions}
					selectedCompetitions={selectedCompetitions}
					onSelectionChange={setSelectedCompetitions}
					onEdit={handleEdit}
					onDuplicate={handleDuplicate}
					onDelete={handleDelete}
					isLoading={isLoading}
				/>
			)}

			{selectedCompetitions.length > 0 && viewMode === "table" && (
				<BulkCompetitionActions
					selectedCount={selectedCompetitions.length}
					onBulkStatusUpdate={handleBulkStatusUpdate}
					onBulkDelete={handleBulkDelete}
					onClearSelection={() => setSelectedCompetitions([])}
				/>
			)}
		</div>
	);
}
