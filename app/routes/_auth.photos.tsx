import {
	Eye,
	Filter,
	Image as ImageIcon,
	Plus,
	Search,
	Trash2,
	Upload,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { PhotoGrid } from "~/components/features/photos/photo-grid";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { useAuth } from "~/hooks/use-auth";
import { trpc } from "~/lib/trpc";


type FilterStatus = "all" | "pending" | "approved" | "rejected";
type SortBy = "date" | "title" | "votes" | "status";

export default function UserPhotos() {
	const navigate = useNavigate();
	const { user } = useAuth();

	const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
	const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
	const [sortBy, setSortBy] = useState<SortBy>("date");
	const [searchQuery, setSearchQuery] = useState("");
	// Get user's photos from tRPC
	const { data: userPhotos, isLoading } = trpc.photo.getUserPhotos.useQuery({});

	const photos = userPhotos || [];

	const filteredPhotos = photos
		.filter((photo) => {
			if (filterStatus !== "all" && photo.status !== filterStatus) return false;
			if (
				searchQuery &&
				!photo.title.toLowerCase().includes(searchQuery.toLowerCase())
			)
				return false;
			return true;
		})
		.sort((a, b) => {
			switch (sortBy) {
				case "title":
					return a.title.localeCompare(b.title);
				case "votes":
					return b.voteCount - a.voteCount;
				case "status":
					return a.status.localeCompare(b.status);
				case "date":
				default:
					return (
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
					);
			}
		});

	const handlePhotoEdit = (photoId: string) => {
		navigate(`/photos/${photoId}/edit`);
	};

	const handlePhotoDelete = (photoId: string) => {
		if (
			confirm(
				"Are you sure you want to delete this photo? This action cannot be undone.",
			)
		) {
			// Handle photo deletion
			console.log("Deleting photo:", photoId);
		}
	};

	const handlePhotoView = (photo: any) => {
		// Navigate to competition view or photo detail
		if (photo.competition) {
			navigate(`/competitions/${photo.competition.id}`);
		}
	};

	const handleBulkDelete = () => {
		if (selectedPhotos.length === 0) return;

		const confirmMessage = `Are you sure you want to delete ${selectedPhotos.length} photo${selectedPhotos.length === 1 ? "" : "s"}? This action cannot be undone.`;

		if (confirm(confirmMessage)) {
			console.log("Bulk deleting photos:", selectedPhotos);
			setSelectedPhotos([]);
		}
	};

	const getStatusCounts = () => {
		const counts = {
			all: photos.length,
			pending: photos.filter((p) => p.status === "pending").length,
			approved: photos.filter((p) => p.status === "approved").length,
			rejected: photos.filter((p) => p.status === "rejected").length,
		};
		return counts;
	};

	const statusCounts = getStatusCounts();

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-semibold">My Photos</h1>
					<p className="text-gray-600">
						Manage your photo submissions and track their status
					</p>
				</div>
				<Button asChild>
					<Link to="/competitions">
						<Plus className="w-4 h-4 mr-2" />
						Submit New Photo
					</Link>
				</Button>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4 text-center">
						<div className="text-2xl font-bold text-blue-600">
							{statusCounts.all}
						</div>
						<div className="text-sm text-gray-600">Total Photos</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4 text-center">
						<div className="text-2xl font-bold text-yellow-600">
							{statusCounts.pending}
						</div>
						<div className="text-sm text-gray-600">Pending Review</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4 text-center">
						<div className="text-2xl font-bold text-green-600">
							{statusCounts.approved}
						</div>
						<div className="text-sm text-gray-600">Approved</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4 text-center">
						<div className="text-2xl font-bold text-red-600">
							{statusCounts.rejected}
						</div>
						<div className="text-sm text-gray-600">Rejected</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters and Search */}
			<Card>
				<CardContent className="p-4">
					<div className="flex flex-col sm:flex-row gap-4">
						{/* Search */}
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
							<Input
								placeholder="Search photos..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>

						{/* Status Filter */}
						<div className="flex items-center gap-2">
							<Filter className="w-4 h-4 text-gray-400" />
							<select
								value={filterStatus}
								onChange={(e) =>
									setFilterStatus(e.target.value as FilterStatus)
								}
								className="border rounded-md px-3 py-2 text-sm"
							>
								<option value="all">All Status ({statusCounts.all})</option>
								<option value="pending">
									Pending ({statusCounts.pending})
								</option>
								<option value="approved">
									Approved ({statusCounts.approved})
								</option>
								<option value="rejected">
									Rejected ({statusCounts.rejected})
								</option>
							</select>
						</div>

						{/* Sort */}
						<select
							value={sortBy}
							onChange={(e) => setSortBy(e.target.value as SortBy)}
							className="border rounded-md px-3 py-2 text-sm"
						>
							<option value="date">Latest First</option>
							<option value="title">Title A-Z</option>
							<option value="votes">Most Votes</option>
							<option value="status">Status</option>
						</select>
					</div>
				</CardContent>
			</Card>

			{/* Bulk Actions */}
			{selectedPhotos.length > 0 && (
				<Card className="border-blue-200 bg-blue-50">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium">
								{selectedPhotos.length} photo
								{selectedPhotos.length === 1 ? "" : "s"} selected
							</span>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setSelectedPhotos([])}
								>
									Clear Selection
								</Button>
								<Button
									variant="destructive"
									size="sm"
									onClick={handleBulkDelete}
								>
									<Trash2 className="w-4 h-4 mr-1" />
									Delete Selected
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Empty State */}
			{!isLoading && filteredPhotos.length === 0 && (
				<Card>
					<CardContent className="text-center py-12">
						{photos.length === 0 ? (
							<>
								<Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
								<h3 className="text-lg font-medium text-gray-900 mb-2">
									No Photos Yet
								</h3>
								<p className="text-gray-500 mb-6">
									Start participating in competitions by submitting your photos.
								</p>
								<Button asChild>
									<Link to="/competitions">
										<Plus className="w-4 h-4 mr-2" />
										Browse Competitions
									</Link>
								</Button>
							</>
						) : (
							<>
								<ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
								<h3 className="text-lg font-medium text-gray-900 mb-2">
									No Photos Found
								</h3>
								<p className="text-gray-500 mb-6">
									No photos match your current filters. Try adjusting your
									search or filters.
								</p>
								<Button
									variant="outline"
									onClick={() => {
										setSearchQuery("");
										setFilterStatus("all");
									}}
								>
									Clear Filters
								</Button>
							</>
						)}
					</CardContent>
				</Card>
			)}

			{/* Photo Grid */}
			{filteredPhotos.length > 0 && (
				<PhotoGrid
					photos={filteredPhotos}
					selectedPhotos={selectedPhotos}
					onSelect={setSelectedPhotos}
					onEdit={handlePhotoEdit}
					onDelete={handlePhotoDelete}
					onView={handlePhotoView}
					enableSelection={true}
					showStatus={true}
					showActions={true}
					isLoading={isLoading}
					emptyMessage="No photos found matching your criteria"
				/>
			)}
		</div>
	);
}
