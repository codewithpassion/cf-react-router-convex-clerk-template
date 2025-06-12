import {
	Calendar,
	Filter,
	Heart,
	Search,
	TrendingUp,
	Trophy,
	Vote,
	X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { PhotoCard } from "~/components/features/photos/photo-card";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { useAuth } from "~/hooks/use-auth";
import { useVoting } from "~/hooks/use-voting";

// Mock data for demonstration
const mockVotingStats = {
	totalVotes: 47,
	votingStreak: 12,
	favoriteCategory: "Landscapes",
	averageVotesPerDay: 3.2,
	topVotedPhoto: {
		title: "Mountain Sunrise",
		photographer: "John Doe",
		votes: 156,
	},
};

const mockVotingHistory = [
	{
		id: "1",
		photo: {
			id: "photo-1",
			title: "Ocean Waves",
			filePath:
				"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400",
			photographer: { id: "user-2", name: "Sarah Wilson" },
			competition: { id: "comp-1", title: "Nature Photography Contest" },
			category: { id: "cat-1", name: "Seascapes" },
		},
		votedAt: "2024-01-20T15:30:00Z",
		competitionStatus: "voting" as const,
	},
	{
		id: "2",
		photo: {
			id: "photo-2",
			title: "City Lights",
			filePath:
				"https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400",
			photographer: { id: "user-3", name: "Mike Chen" },
			competition: { id: "comp-2", title: "Urban Life Challenge" },
			category: { id: "cat-2", name: "Street Photography" },
		},
		votedAt: "2024-01-19T20:15:00Z",
		competitionStatus: "closed" as const,
	},
	{
		id: "3",
		photo: {
			id: "photo-3",
			title: "Forest Path",
			filePath:
				"https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400",
			photographer: { id: "user-4", name: "Emma Davis" },
			competition: { id: "comp-1", title: "Nature Photography Contest" },
			category: { id: "cat-3", name: "Landscapes" },
		},
		votedAt: "2024-01-18T10:45:00Z",
		competitionStatus: "voting" as const,
	},
];

type FilterPeriod = "week" | "month" | "all";
type SortBy = "recent" | "competition" | "category";

export default function UserVoting() {
	const { user } = useAuth();
	const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("month");
	const [sortBy, setSortBy] = useState<SortBy>("recent");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

	// Mock data - replace with actual tRPC calls
	const stats = mockVotingStats;
	const votingHistory = mockVotingHistory;

	// Filter voting history
	const filteredHistory = votingHistory.filter((vote) => {
		// Search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			const matchesTitle = vote.photo.title.toLowerCase().includes(query);
			const matchesPhotographer = vote.photo.photographer.name
				.toLowerCase()
				.includes(query);
			const matchesCompetition = vote.photo.competition.title
				.toLowerCase()
				.includes(query);
			if (!matchesTitle && !matchesPhotographer && !matchesCompetition) {
				return false;
			}
		}

		// Category filter
		if (selectedCategory && vote.photo.category.id !== selectedCategory) {
			return false;
		}

		// Period filter
		const voteDate = new Date(vote.votedAt);
		const now = new Date();
		const daysAgo =
			(now.getTime() - voteDate.getTime()) / (1000 * 60 * 60 * 24);

		if (filterPeriod === "week" && daysAgo > 7) return false;
		if (filterPeriod === "month" && daysAgo > 30) return false;

		return true;
	});

	// Sort filtered history
	const sortedHistory = [...filteredHistory].sort((a, b) => {
		switch (sortBy) {
			case "recent":
				return new Date(b.votedAt).getTime() - new Date(a.votedAt).getTime();
			case "competition":
				return a.photo.competition.title.localeCompare(
					b.photo.competition.title,
				);
			case "category":
				return a.photo.category.name.localeCompare(b.photo.category.name);
			default:
				return 0;
		}
	});

	const handleRemoveVote = (voteId: string) => {
		if (confirm("Are you sure you want to remove this vote?")) {
			console.log("Removing vote:", voteId);
			// Implement vote removal logic
		}
	};

	const handlePhotoClick = (photo: any) => {
		// Navigate to competition or photo detail
		window.location.href = `/competitions/${photo.competition.id}`;
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-semibold">My Voting Activity</h1>
				<p className="text-gray-600">
					Track your votes and discover new favorites
				</p>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4 text-center">
						<div className="text-2xl font-bold text-blue-600">
							{stats.totalVotes}
						</div>
						<div className="text-sm text-gray-600 flex items-center justify-center gap-1">
							<Heart className="w-3 h-3" />
							Total Votes
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4 text-center">
						<div className="text-2xl font-bold text-green-600">
							{stats.votingStreak}
						</div>
						<div className="text-sm text-gray-600 flex items-center justify-center gap-1">
							<TrendingUp className="w-3 h-3" />
							Day Streak
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4 text-center">
						<div className="text-2xl font-bold text-purple-600">
							{stats.favoriteCategory}
						</div>
						<div className="text-sm text-gray-600">Favorite Category</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4 text-center">
						<div className="text-2xl font-bold text-orange-600">
							{stats.averageVotesPerDay.toFixed(1)}
						</div>
						<div className="text-sm text-gray-600">Votes/Day</div>
					</CardContent>
				</Card>
			</div>

			{/* Top Voted Photo */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Trophy className="w-5 h-5 text-amber-500" />
						Your Top Voted Photo
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-4">
						<div className="w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center">
							<Trophy className="w-8 h-8 text-amber-500" />
						</div>
						<div>
							<h3 className="font-medium">{stats.topVotedPhoto.title}</h3>
							<p className="text-sm text-gray-600">
								by {stats.topVotedPhoto.photographer}
							</p>
							<p className="text-sm text-gray-500">
								{stats.topVotedPhoto.votes} votes
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Filters */}
			<Card>
				<CardContent className="p-4">
					<div className="flex flex-col md:flex-row gap-4">
						{/* Search */}
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
							<Input
								placeholder="Search photos, photographers, or competitions..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>

						{/* Period Filter */}
						<div className="flex items-center gap-2">
							<Filter className="w-4 h-4 text-gray-400" />
							<select
								value={filterPeriod}
								onChange={(e) =>
									setFilterPeriod(e.target.value as FilterPeriod)
								}
								className="border rounded-md px-3 py-2 text-sm bg-white"
							>
								<option value="week">Last Week</option>
								<option value="month">Last Month</option>
								<option value="all">All Time</option>
							</select>
						</div>

						{/* Sort */}
						<select
							value={sortBy}
							onChange={(e) => setSortBy(e.target.value as SortBy)}
							className="border rounded-md px-3 py-2 text-sm bg-white"
						>
							<option value="recent">Most Recent</option>
							<option value="competition">By Competition</option>
							<option value="category">By Category</option>
						</select>
					</div>

					{/* Active Filters */}
					{(searchQuery || selectedCategory || filterPeriod !== "all") && (
						<div className="flex flex-wrap gap-2 mt-3">
							{searchQuery && (
								<div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
									<span>Search: {searchQuery}</span>
									<button
										type="button"
										onClick={() => setSearchQuery("")}
										className="hover:bg-blue-200 rounded"
									>
										<X className="w-3 h-3" />
									</button>
								</div>
							)}
							{filterPeriod !== "all" && (
								<div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
									<span>
										{filterPeriod === "week" ? "Last Week" : "Last Month"}
									</span>
									<button
										type="button"
										onClick={() => setFilterPeriod("all")}
										className="hover:bg-green-200 rounded"
									>
										<X className="w-3 h-3" />
									</button>
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Voting History */}
			<Card>
				<CardHeader>
					<CardTitle>Voting History</CardTitle>
					<div className="text-sm text-gray-600">
						{sortedHistory.length} vote{sortedHistory.length === 1 ? "" : "s"}{" "}
						found
					</div>
				</CardHeader>
				<CardContent>
					{sortedHistory.length > 0 ? (
						<div className="space-y-4">
							{sortedHistory.map((vote) => (
								<VotingHistoryEntry
									key={vote.id}
									vote={vote}
									onRemove={() => handleRemoveVote(vote.id)}
									onPhotoClick={() => handlePhotoClick(vote.photo)}
								/>
							))}
						</div>
					) : (
						<div className="text-center py-12">
							<Vote className="w-12 h-12 mx-auto text-gray-400 mb-4" />
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								No votes found
							</h3>
							<p className="text-gray-600 mb-4">
								{searchQuery || selectedCategory || filterPeriod !== "all"
									? "Try adjusting your filters to see more results."
									: "Start voting on photos to see your activity here."}
							</p>
							<Button asChild>
								<Link to="/competitions">Browse Competitions</Link>
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

// Voting history entry component
interface VotingHistoryEntryProps {
	vote: {
		id: string;
		photo: {
			id: string;
			title: string;
			filePath: string;
			photographer: { id: string; name: string };
			competition: { id: string; title: string };
			category: { id: string; name: string };
		};
		votedAt: string;
		competitionStatus: "open" | "voting" | "closed";
	};
	onRemove: () => void;
	onPhotoClick: () => void;
}

function VotingHistoryEntry({
	vote,
	onRemove,
	onPhotoClick,
}: VotingHistoryEntryProps) {
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

		if (diffInHours < 24) {
			return `${Math.floor(diffInHours)} hours ago`;
		}
		const diffInDays = Math.floor(diffInHours / 24);
		if (diffInDays < 7) {
			return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
		}
		return date.toLocaleDateString();
	};

	const getStatusColor = (status: string) => {
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
		<div className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-sm transition-shadow">
			{/* Photo thumbnail */}
			<div
				className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
				onClick={onPhotoClick}
			>
				<img
					src={vote.photo.filePath}
					alt={vote.photo.title}
					className="w-full h-full object-cover"
				/>
			</div>

			{/* Vote details */}
			<div className="flex-1 min-w-0">
				<h4
					className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer transition-colors"
					onClick={onPhotoClick}
				>
					{vote.photo.title}
				</h4>
				<div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
					<span>by {vote.photo.photographer.name}</span>
					<span>•</span>
					<span>{vote.photo.category.name}</span>
				</div>
				<div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
					<Calendar className="w-3 h-3" />
					<span>{formatDate(vote.votedAt)}</span>
					<span>•</span>
					<Link
						to={`/competitions/${vote.photo.competition.id}`}
						className="text-blue-600 hover:text-blue-800 transition-colors"
					>
						{vote.photo.competition.title}
					</Link>
				</div>
			</div>

			{/* Competition status */}
			<div className="flex-shrink-0">
				<span
					className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
						vote.competitionStatus,
					)}`}
				>
					{vote.competitionStatus === "open" && "Submissions Open"}
					{vote.competitionStatus === "voting" && "Voting Active"}
					{vote.competitionStatus === "closed" && "Completed"}
				</span>
			</div>

			{/* Remove vote button */}
			<div className="flex-shrink-0">
				<Button
					variant="ghost"
					size="sm"
					onClick={onRemove}
					className="text-gray-400 hover:text-red-600"
				>
					<X className="w-4 h-4" />
				</Button>
			</div>
		</div>
	);
}
