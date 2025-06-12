import { Filter, Search, Shuffle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { ViewModeSelector } from "./voting-gallery";

interface Category {
	id: string;
	name: string;
	description?: string;
	_count?: {
		photos: number;
	};
}

interface VotingControlsProps {
	categories: Category[];
	selectedCategory: string | null;
	onCategoryChange: (categoryId: string | null) => void;
	sortBy: "random" | "recent" | "popular" | "least-voted";
	onSortChange: (sort: "random" | "recent" | "popular" | "least-voted") => void;
	viewMode: "grid" | "slideshow" | "list";
	onViewModeChange: (mode: "grid" | "slideshow" | "list") => void;
	searchQuery?: string;
	onSearchChange?: (query: string) => void;
	showOnlyUnvoted?: boolean;
	onShowUnvotedChange?: (show: boolean) => void;
	totalPhotos?: number;
	votedPhotos?: number;
	className?: string;
}

export function VotingControls({
	categories,
	selectedCategory,
	onCategoryChange,
	sortBy,
	onSortChange,
	viewMode,
	onViewModeChange,
	searchQuery = "",
	onSearchChange,
	showOnlyUnvoted = false,
	onShowUnvotedChange,
	totalPhotos = 0,
	votedPhotos = 0,
	className,
}: VotingControlsProps) {
	const handleRandomize = () => {
		onSortChange("random");
	};

	return (
		<div className={cn("bg-white rounded-lg border p-6 space-y-6", className)}>
			{/* Top row - Search and View Mode */}
			<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
				{/* Search */}
				{onSearchChange && (
					<div className="relative flex-1 max-w-md">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
						<Input
							placeholder="Search photos..."
							value={searchQuery}
							onChange={(e) => onSearchChange(e.target.value)}
							className="pl-10"
						/>
					</div>
				)}

				{/* View Mode Selector */}
				<ViewModeSelector
					currentMode={viewMode}
					onModeChange={onViewModeChange}
				/>
			</div>

			{/* Second row - Filters */}
			<div className="flex flex-wrap gap-4 items-center">
				{/* Category Filter */}
				<div className="flex items-center gap-2">
					<Filter className="w-4 h-4 text-gray-400" />
					<Label htmlFor="category" className="text-sm font-medium">
						Category:
					</Label>
					<select
						id="category"
						value={selectedCategory || "all"}
						onChange={(e) =>
							onCategoryChange(e.target.value === "all" ? null : e.target.value)
						}
						className="border rounded-md px-3 py-2 text-sm bg-white min-w-32"
					>
						<option value="all">All ({totalPhotos})</option>
						{categories.map((category) => (
							<option key={category.id} value={category.id}>
								{category.name} ({category._count?.photos || 0})
							</option>
						))}
					</select>
				</div>

				{/* Sort Filter */}
				<div className="flex items-center gap-2">
					<Label htmlFor="sort" className="text-sm font-medium">
						Sort by:
					</Label>
					<select
						id="sort"
						value={sortBy}
						onChange={(e) =>
							onSortChange(
								e.target.value as
									| "random"
									| "recent"
									| "popular"
									| "least-voted",
							)
						}
						className="border rounded-md px-3 py-2 text-sm bg-white min-w-32"
					>
						<option value="random">Random</option>
						<option value="recent">Most Recent</option>
						<option value="popular">Most Popular</option>
						<option value="least-voted">Least Voted</option>
					</select>
				</div>

				{/* Randomize Button */}
				<Button
					variant="outline"
					size="sm"
					onClick={handleRandomize}
					className="gap-2"
				>
					<Shuffle className="w-4 h-4" />
					Shuffle
				</Button>

				{/* Show Only Unvoted */}
				{onShowUnvotedChange && (
					<div className="flex items-center space-x-2">
						<Checkbox
							id="unvoted"
							checked={showOnlyUnvoted}
							onCheckedChange={onShowUnvotedChange}
						/>
						<Label htmlFor="unvoted" className="text-sm">
							Show only unvoted
						</Label>
					</div>
				)}
			</div>

			{/* Progress indicator */}
			{votedPhotos !== undefined && totalPhotos > 0 && (
				<div className="bg-gray-50 rounded-lg p-4">
					<div className="flex justify-between items-center mb-2">
						<span className="text-sm font-medium">Voting Progress</span>
						<span className="text-sm text-gray-600">
							{votedPhotos} of {totalPhotos} voted
						</span>
					</div>
					<div className="w-full bg-gray-200 rounded-full h-2">
						<div
							className="bg-blue-500 h-2 rounded-full transition-all duration-300"
							style={{ width: `${(votedPhotos / totalPhotos) * 100}%` }}
						/>
					</div>
					{votedPhotos === totalPhotos && (
						<p className="text-sm text-green-600 mt-2 font-medium">
							🎉 You've voted on all photos in this competition!
						</p>
					)}
				</div>
			)}
		</div>
	);
}

// Quick filters component for common actions
interface QuickFiltersProps {
	onShowPopular: () => void;
	onShowRecent: () => void;
	onShowUnvoted: () => void;
	onRandomize: () => void;
	className?: string;
}

export function QuickFilters({
	onShowPopular,
	onShowRecent,
	onShowUnvoted,
	onRandomize,
	className,
}: QuickFiltersProps) {
	const filters = [
		{ label: "Popular", action: onShowPopular },
		{ label: "Recent", action: onShowRecent },
		{ label: "Unvoted", action: onShowUnvoted },
		{ label: "Shuffle", action: onRandomize },
	];

	return (
		<div className={cn("flex gap-2 flex-wrap", className)}>
			{filters.map((filter) => (
				<Button
					key={filter.label}
					variant="outline"
					size="sm"
					onClick={filter.action}
					className="text-xs"
				>
					{filter.label}
				</Button>
			))}
		</div>
	);
}

// Competition info component
interface CompetitionInfoProps {
	title: string;
	description: string;
	status: "open" | "voting" | "closed";
	votingStartDate?: string;
	votingEndDate?: string;
	totalPhotos: number;
	totalVotes: number;
	participants: number;
	className?: string;
}

export function CompetitionInfo({
	title,
	description,
	status,
	votingStartDate,
	votingEndDate,
	totalPhotos,
	totalVotes,
	participants,
	className,
}: CompetitionInfoProps) {
	const getStatusMessage = () => {
		switch (status) {
			case "open":
				return "Submissions are open. Voting hasn't started yet.";
			case "voting":
				return votingEndDate
					? `Voting is open until ${new Date(votingEndDate).toLocaleDateString()}`
					: "Voting is currently open";
			case "closed":
				return "Voting has ended. View the final results.";
			default:
				return "";
		}
	};

	const getStatusColor = () => {
		switch (status) {
			case "open":
				return "text-blue-600 bg-blue-100";
			case "voting":
				return "text-green-600 bg-green-100";
			case "closed":
				return "text-gray-600 bg-gray-100";
			default:
				return "text-gray-600 bg-gray-100";
		}
	};

	return (
		<div className={cn("bg-white rounded-lg border p-6", className)}>
			<div className="mb-4">
				<h1 className="text-2xl font-bold mb-2">{title}</h1>
				<p className="text-gray-600 mb-4">{description}</p>

				<div
					className={cn(
						"inline-flex px-3 py-1 rounded-full text-sm font-medium",
						getStatusColor(),
					)}
				>
					{getStatusMessage()}
				</div>
			</div>

			<div className="flex flex-wrap gap-6 text-sm text-gray-600">
				<div className="flex items-center gap-1">
					<span className="font-medium">{totalPhotos}</span>
					<span>photos</span>
				</div>
				<div className="flex items-center gap-1">
					<span className="font-medium">{totalVotes}</span>
					<span>votes</span>
				</div>
				<div className="flex items-center gap-1">
					<span className="font-medium">{participants}</span>
					<span>participants</span>
				</div>
			</div>
		</div>
	);
}
