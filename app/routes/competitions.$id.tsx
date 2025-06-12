import { format, formatDistanceToNow, isAfter } from "date-fns";
import {
	ArrowLeft,
	Calendar,
	Camera,
	Clock,
	Eye,
	Trophy,
	Upload,
	Users,
	Vote,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { PhotoDetailModal } from "~/components/features/voting/photo-detail-modal";
import {
	CompetitionInfo,
	VotingControls,
} from "~/components/features/voting/voting-controls";
import {
	type Photo,
	VotingGallery,
} from "~/components/features/voting/voting-gallery";
import { MainLayout } from "~/components/main-layout";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { StatusBadge } from "~/components/ui/status-badge";
import { useRealtimeCompetitionVotes } from "~/hooks/use-realtime-votes";
import { trpc } from "~/lib/trpc";

export default function CompetitionDetail() {
	const { id } = useParams();
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [viewMode, setViewMode] = useState<"grid" | "slideshow" | "list">(
		"grid",
	);
	const [sortBy, setSortBy] = useState<
		"random" | "recent" | "popular" | "least-voted"
	>("random");
	const [searchQuery, setSearchQuery] = useState("");
	const [showOnlyUnvoted, setShowOnlyUnvoted] = useState(false);
	const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

	// Get competition data from tRPC
	const { data: competition, isLoading: competitionLoading } =
		trpc.competition.getById.useQuery({ id: id ?? "" }, { enabled: !!id });

	// Get competition photos
	const { data: photosData, isLoading: photosLoading } =
		trpc.competition.getPhotos.useQuery(
			{
				competitionId: id ?? "",
				categoryId: selectedCategory || undefined,
				limit: 100,
			},
			{ enabled: !!id },
		);

	const isLoading = competitionLoading || photosLoading;
	const photos =
		photosData?.photos.map((p) => ({
			...p,
			canVote: competition?.status === "voting",
			status: "approved" as const,
			category: {
				id: p.categoryId,
				name: p.categoryName,
			},
		})) || [];

	// Real-time vote updates
	const { getPhotoVotes, hasUserVoted } = useRealtimeCompetitionVotes(id || "");

	// Handle loading and error states
	if (isLoading) {
		return (
			<MainLayout>
				<div className="container mx-auto px-4 py-8">
					<div className="text-center">Loading competition...</div>
				</div>
			</MainLayout>
		);
	}

	if (!competition) {
		return (
			<MainLayout>
				<div className="container mx-auto px-4 py-8">
					<div className="text-center">
						<h1 className="text-2xl font-bold mb-4">Competition not found</h1>
						<Link to="/competitions" className="text-blue-600 hover:underline">
							Back to competitions
						</Link>
					</div>
				</div>
			</MainLayout>
		);
	}

	const now = new Date();
	const endDate = new Date(competition.endDate);
	const timeLeft = isAfter(endDate, now)
		? formatDistanceToNow(endDate, { addSuffix: true })
		: null;

	// Filter and sort photos
	let filteredPhotos = photos;

	// Apply category filter
	if (selectedCategory) {
		filteredPhotos = filteredPhotos.filter(
			(photo) => photo.categoryId === selectedCategory,
		);
	}

	// Apply search filter
	if (searchQuery) {
		filteredPhotos = filteredPhotos.filter(
			(photo) =>
				photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				photo.photographer.name
					.toLowerCase()
					.includes(searchQuery.toLowerCase()),
		);
	}

	// Apply unvoted filter
	if (showOnlyUnvoted) {
		filteredPhotos = filteredPhotos.filter((photo) => !hasUserVoted(photo.id));
	}

	// Apply sorting
	filteredPhotos = [...filteredPhotos].sort((a, b) => {
		switch (sortBy) {
			case "recent":
				return (
					new Date(b.submittedAt || "").getTime() -
					new Date(a.submittedAt || "").getTime()
				);
			case "popular":
				return getPhotoVotes(b.id) - getPhotoVotes(a.id);
			case "least-voted":
				return getPhotoVotes(a.id) - getPhotoVotes(b.id);
			default:
				return Math.random() - 0.5;
		}
	});

	const handlePhotoClick = (photo: Photo) => {
		setSelectedPhoto(photo);
	};

	const handleVote = (photoId: string, voted: boolean) => {
		console.log("Vote:", photoId, voted);
		// This will be handled by the vote button internally
	};

	const handleNavigatePhoto = (direction: "prev" | "next") => {
		if (!selectedPhoto) return;

		const currentIndex = filteredPhotos.findIndex(
			(p) => p.id === selectedPhoto.id,
		);
		let newIndex: number;

		if (direction === "prev") {
			newIndex =
				currentIndex === 0 ? filteredPhotos.length - 1 : currentIndex - 1;
		} else {
			newIndex = (currentIndex + 1) % filteredPhotos.length;
		}

		setSelectedPhoto(filteredPhotos[newIndex]);
	};

	const votedCount = photos.filter((photo) => hasUserVoted(photo.id)).length;

	return (
		<MainLayout>
			<div className="min-h-screen bg-gray-50">
				{/* Header */}
				<div className="bg-white border-b">
					<div className="container mx-auto px-4 py-6">
						<div className="flex items-center gap-4 mb-4">
							<Button variant="ghost" size="sm" asChild>
								<Link to="/competitions">
									<ArrowLeft className="w-4 h-4 mr-2" />
									Back to Competitions
								</Link>
							</Button>
						</div>

						<div className="flex flex-col lg:flex-row gap-6">
							<div className="flex-1">
								<div className="flex items-center gap-3 mb-3">
									<Trophy className="w-8 h-8 text-amber-500" />
									<h1 className="text-3xl font-bold text-gray-900">
										{competition.title}
									</h1>
									<StatusBadge status={competition.status} />
								</div>

								<p className="text-lg text-gray-600 mb-4">
									{competition.description}
								</p>

								<div className="flex flex-wrap gap-6 text-sm text-gray-600">
									<div className="flex items-center gap-2">
										<Calendar className="w-4 h-4" />
										<span>
											{format(new Date(competition.startDate), "MMM dd")} -{" "}
											{format(new Date(competition.endDate), "MMM dd, yyyy")}
										</span>
									</div>
									{timeLeft && (
										<div className="flex items-center gap-2 text-blue-600">
											<Clock className="w-4 h-4" />
											<span className="font-medium">{timeLeft}</span>
										</div>
									)}
									<div className="flex items-center gap-2">
										<Camera className="w-4 h-4" />
										<span>{competition._count.photos} photos</span>
									</div>
									<div className="flex items-center gap-2">
										<Vote className="w-4 h-4" />
										<span>{competition._count.votes} votes</span>
									</div>
									<div className="flex items-center gap-2">
										<Users className="w-4 h-4" />
										<span>{competition._count.participants} participants</span>
									</div>
								</div>
							</div>

							<div className="lg:w-64">
								{competition.status === "open" && (
									<Button size="lg" className="w-full mb-4" asChild>
										<Link to={`/competitions/${competition.id}/submit`}>
											<Upload className="w-4 h-4 mr-2" />
											Submit Photo
										</Link>
									</Button>
								)}
								{competition.status === "voting" && (
									<Button size="lg" className="w-full mb-4" variant="outline">
										<Vote className="w-4 h-4 mr-2" />
										Vote Now
									</Button>
								)}
								{competition.status === "closed" && (
									<Button
										size="lg"
										className="w-full mb-4"
										variant="outline"
										asChild
									>
										<Link to={`/competitions/${competition.id}/results`}>
											<Trophy className="w-4 h-4 mr-2" />
											View Results
										</Link>
									</Button>
								)}
							</div>
						</div>
					</div>
				</div>

				<div className="container mx-auto px-4 py-8 space-y-8">
					{/* Voting Controls */}
					{competition.status === "voting" && (
						<VotingControls
							categories={competition.categories}
							selectedCategory={selectedCategory}
							onCategoryChange={setSelectedCategory}
							sortBy={sortBy}
							onSortChange={setSortBy}
							viewMode={viewMode}
							onViewModeChange={setViewMode}
							searchQuery={searchQuery}
							onSearchChange={setSearchQuery}
							showOnlyUnvoted={showOnlyUnvoted}
							onShowUnvotedChange={setShowOnlyUnvoted}
							totalPhotos={photos.length}
							votedPhotos={votedCount}
						/>
					)}

					<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
						{/* Sidebar */}
						<div className="lg:col-span-1 space-y-6">
							{/* Categories */}
							<Card>
								<CardHeader>
									<CardTitle>Categories</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2">
									<button
										type="button"
										onClick={() => setSelectedCategory(null)}
										className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
											selectedCategory === null
												? "bg-blue-100 text-blue-700"
												: "hover:bg-gray-100"
										}`}
									>
										All Categories ({photos.length})
									</button>
									{competition.categories.map((category) => (
										<button
											type="button"
											key={category.id}
											onClick={() => setSelectedCategory(category.id)}
											className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
												selectedCategory === category.id
													? "bg-blue-100 text-blue-700"
													: "hover:bg-gray-100"
											}`}
										>
											{category.name} (
											{
												photos.filter((p) => p.categoryId === category.id)
													.length
											}
											)
										</button>
									))}
								</CardContent>
							</Card>

							{/* Rules */}
							<Card>
								<CardHeader>
									<CardTitle>Competition Rules</CardTitle>
								</CardHeader>
								<CardContent>
									<ul className="space-y-2 text-sm">
										{competition.rules?.map((rule, index) => (
											<li key={rule} className="flex items-start gap-2">
												<span className="text-blue-600 mt-1">•</span>
												<span>{rule}</span>
											</li>
										))}
									</ul>
								</CardContent>
							</Card>

							{/* Prizes */}
							<Card>
								<CardHeader>
									<CardTitle>Prizes</CardTitle>
								</CardHeader>
								<CardContent>
									<ul className="space-y-2 text-sm">
										{competition.prizes?.map((prize, index) => (
											<li key={prize} className="flex items-start gap-2">
												<Trophy className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
												<span>{prize}</span>
											</li>
										))}
									</ul>
								</CardContent>
							</Card>
						</div>

						{/* Main Content */}
						<div className="lg:col-span-3">
							<div className="flex justify-between items-center mb-6">
								<h2 className="text-xl font-semibold">
									{selectedCategory
										? `${competition.categories.find((c) => c.id === selectedCategory)?.name} Photos`
										: "All Photos"}
								</h2>
								<div className="text-gray-600">
									{filteredPhotos.length} photo
									{filteredPhotos.length === 1 ? "" : "s"}
								</div>
							</div>

							{/* Voting Gallery */}
							<VotingGallery
								photos={filteredPhotos}
								viewMode={viewMode}
								isLoading={isLoading}
								onPhotoClick={handlePhotoClick}
								onVote={handleVote}
								competitionStatus={competition.status}
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Photo Detail Modal */}
			<PhotoDetailModal
				photo={selectedPhoto}
				isOpen={!!selectedPhoto}
				onClose={() => setSelectedPhoto(null)}
				onNavigate={handleNavigatePhoto}
				competitionStatus={competition.status}
			/>
		</MainLayout>
	);
}
