import { Camera, Filter, Search, Trophy, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { CompetitionCard } from "~/components/features/competitions/competition-card";
import { MainLayout } from "~/components/main-layout";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import { trpc } from "~/lib/trpc";


export default function CompetitionsIndex() {
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [sortBy, setSortBy] = useState("recent");

	// Get competitions from tRPC
	const { data: competitionsData, isLoading } = trpc.competition.getAll.useQuery({
		status: statusFilter === "all" ? undefined : (statusFilter as "open" | "voting" | "closed"),
		limit: 50,
	});

	const competitions = competitionsData?.competitions || [];

	// Filter by search query (server-side filtering would be better for large datasets)
	const filteredCompetitions = competitions.filter((competition) => {
		if (!searchQuery) return true;
		const matchesSearch =
			competition.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			competition.description.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesSearch;
	});

	return (
		<MainLayout>
			<div className="min-h-screen bg-gray-50">
				{/* Hero Section */}
				<div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
					<div className="container mx-auto px-4 py-16">
						<div className="text-center max-w-3xl mx-auto">
							<div className="flex justify-center mb-6">
								<div className="p-4 bg-white/10 rounded-full">
									<Trophy className="w-12 h-12" />
								</div>
							</div>
							<h1 className="text-4xl md:text-5xl font-bold mb-6">
								Photo Competitions
							</h1>
							<p className="text-xl md:text-2xl mb-8 text-blue-100">
								Join exciting photography competitions and showcase your talent
								to the world
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<div className="flex items-center gap-2 text-blue-100">
									<Camera className="w-5 h-5" />
									<span>Submit Your Best Photos</span>
								</div>
								<div className="flex items-center gap-2 text-blue-100">
									<Users className="w-5 h-5" />
									<span>Vote & Engage</span>
								</div>
								<div className="flex items-center gap-2 text-blue-100">
									<Trophy className="w-5 h-5" />
									<span>Win Amazing Prizes</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="container mx-auto px-4 py-8">
					{/* Filters */}
					<div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
						<div className="flex flex-col lg:flex-row gap-4">
							{/* Search */}
							<div className="relative flex-1">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
								<Input
									placeholder="Search competitions..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-10"
								/>
							</div>

							{/* Status Filter */}
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger className="w-full lg:w-48">
									<Filter className="w-4 h-4 mr-2" />
									<SelectValue placeholder="Filter by status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Competitions</SelectItem>
									<SelectItem value="open">Open for Submissions</SelectItem>
									<SelectItem value="voting">Voting Phase</SelectItem>
									<SelectItem value="closed">Completed</SelectItem>
								</SelectContent>
							</Select>

							{/* Sort */}
							<Select value={sortBy} onValueChange={setSortBy}>
								<SelectTrigger className="w-full lg:w-48">
									<SelectValue placeholder="Sort by" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="recent">Most Recent</SelectItem>
									<SelectItem value="popular">Most Popular</SelectItem>
									<SelectItem value="ending-soon">Ending Soon</SelectItem>
									<SelectItem value="entries">Most Entries</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Active Filters */}
					{(searchQuery || statusFilter !== "all") && (
						<div className="flex items-center gap-2 mb-6">
							<span className="text-sm text-gray-600">Active filters:</span>
							{searchQuery && (
								<span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
									Search: "{searchQuery}"
									<button
										type="button"
										onClick={() => setSearchQuery("")}
										className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
									>
										×
									</button>
								</span>
							)}
							{statusFilter !== "all" && (
								<span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
									Status: {statusFilter}
									<button
										type="button"
										onClick={() => setStatusFilter("all")}
										className="ml-1 hover:bg-green-200 rounded-full p-0.5"
									>
										×
									</button>
								</span>
							)}
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									setSearchQuery("");
									setStatusFilter("all");
								}}
							>
								Clear all
							</Button>
						</div>
					)}

					{/* Results Summary */}
					<div className="flex justify-between items-center mb-6">
						<div className="text-gray-600">
							{filteredCompetitions.length === 0
								? "No competitions found"
								: `${filteredCompetitions.length} competition${filteredCompetitions.length === 1 ? "" : "s"} found`}
						</div>
					</div>

					{/* Competitions Grid */}
					{isLoading ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{[...Array(6)].map((_, i) => (
								<div key={`loading-${i}`} className="space-y-4">
									<Skeleton className="h-64 w-full rounded-lg" />
									<div className="space-y-2">
										<Skeleton className="h-4 w-3/4" />
										<Skeleton className="h-4 w-1/2" />
									</div>
								</div>
							))}
						</div>
					) : filteredCompetitions.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{filteredCompetitions.map((competition) => (
								<CompetitionCard
									key={competition.id}
									competition={competition}
									onClick={() => navigate(`/competitions/${competition.id}`)}
								/>
							))}
						</div>
					) : (
						<div className="text-center py-12">
							<div className="max-w-md mx-auto">
								<div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
									<Search className="w-8 h-8 text-gray-400" />
								</div>
								<h3 className="text-lg font-medium text-gray-900 mb-2">
									No competitions found
								</h3>
								<p className="text-gray-600 mb-4">
									{searchQuery || statusFilter !== "all"
										? "Try adjusting your search criteria or filters"
										: "Check back soon for new photography competitions"}
								</p>
								{(searchQuery || statusFilter !== "all") && (
									<Button
										variant="outline"
										onClick={() => {
											setSearchQuery("");
											setStatusFilter("all");
										}}
									>
										Clear filters
									</Button>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</MainLayout>
	);
}
