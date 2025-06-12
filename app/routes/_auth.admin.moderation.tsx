import { format } from "date-fns";
import {
	AlertTriangle,
	Calendar,
	Camera,
	CheckCircle,
	Clock,
	Eye,
	Filter,
	Flag,
	Grid,
	List,
	MoreHorizontal,
	Search,
	Shield,
	User,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { StatusBadge } from "~/components/ui/status-badge";
import { Textarea } from "~/components/ui/textarea";
import {
	useBulkActions,
	useBulkModeratePhotos,
	useModeratePhoto,
	useModerationStats,
	usePendingPhotos,
} from "~/hooks/use-admin";

interface ModerationStatsProps {
	stats?: {
		pending: number;
		approved: number;
		rejected: number;
		averageTime: string;
		todayProcessed: number;
	};
}

function ModerationStats({ stats }: ModerationStatsProps) {
	if (!stats) {
		return (
			<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
				{[1, 2, 3, 4, 5].map((i) => (
					<Card key={i} className="animate-pulse">
						<CardContent className="p-4">
							<div className="h-4 bg-gray-200 rounded mb-2" />
							<div className="h-6 bg-gray-200 rounded" />
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
			<Card className="border-orange-200 bg-orange-50">
				<CardContent className="p-4">
					<div className="flex items-center gap-2 mb-1">
						<Clock className="w-4 h-4 text-orange-600" />
						<span className="text-sm font-medium text-orange-700">Pending</span>
					</div>
					<div className="text-2xl font-bold text-orange-900">
						{stats.pending}
					</div>
				</CardContent>
			</Card>

			<Card className="border-green-200 bg-green-50">
				<CardContent className="p-4">
					<div className="flex items-center gap-2 mb-1">
						<CheckCircle className="w-4 h-4 text-green-600" />
						<span className="text-sm font-medium text-green-700">Approved</span>
					</div>
					<div className="text-2xl font-bold text-green-900">
						{stats.approved}
					</div>
				</CardContent>
			</Card>

			<Card className="border-red-200 bg-red-50">
				<CardContent className="p-4">
					<div className="flex items-center gap-2 mb-1">
						<XCircle className="w-4 h-4 text-red-600" />
						<span className="text-sm font-medium text-red-700">Rejected</span>
					</div>
					<div className="text-2xl font-bold text-red-900">
						{stats.rejected}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="p-4">
					<div className="flex items-center gap-2 mb-1">
						<Clock className="w-4 h-4 text-gray-600" />
						<span className="text-sm font-medium text-gray-700">Avg. Time</span>
					</div>
					<div className="text-xl font-bold">{stats.averageTime}</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="p-4">
					<div className="flex items-center gap-2 mb-1">
						<CheckCircle className="w-4 h-4 text-blue-600" />
						<span className="text-sm font-medium text-gray-700">Today</span>
					</div>
					<div className="text-xl font-bold">{stats.todayProcessed}</div>
				</CardContent>
			</Card>
		</div>
	);
}

interface ModerationFiltersProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	filterCategory: string | null;
	onCategoryChange: (value: string | null) => void;
	sortBy: string;
	onSortChange: (value: string) => void;
	viewMode: "grid" | "detailed";
	onViewModeChange: (mode: "grid" | "detailed") => void;
}

function ModerationFilters({
	searchQuery,
	onSearchChange,
	filterCategory,
	onCategoryChange,
	sortBy,
	onSortChange,
	viewMode,
	onViewModeChange,
}: ModerationFiltersProps) {
	return (
		<Card>
			<CardContent className="p-6">
				<div className="flex flex-col sm:flex-row gap-4">
					<div className="flex-1">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
							<Input
								placeholder="Search photos by title, user, or competition..."
								value={searchQuery}
								onChange={(e) => onSearchChange(e.target.value)}
								className="pl-10"
							/>
						</div>
					</div>
					<div className="flex gap-2">
						<Select
							value={filterCategory || "all"}
							onValueChange={(value) =>
								onCategoryChange(value === "all" ? null : value)
							}
						>
							<SelectTrigger className="w-40">
								<Filter className="w-4 h-4 mr-2" />
								<SelectValue placeholder="Category" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Categories</SelectItem>
								<SelectItem value="nature">Nature</SelectItem>
								<SelectItem value="portrait">Portrait</SelectItem>
								<SelectItem value="street">Street</SelectItem>
								<SelectItem value="landscape">Landscape</SelectItem>
							</SelectContent>
						</Select>

						<Select value={sortBy} onValueChange={onSortChange}>
							<SelectTrigger className="w-40">
								<SelectValue placeholder="Sort by" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="date">Submission Date</SelectItem>
								<SelectItem value="reports">Report Count</SelectItem>
								<SelectItem value="competition">Competition</SelectItem>
								<SelectItem value="user">User Name</SelectItem>
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
								variant={viewMode === "detailed" ? "default" : "ghost"}
								size="sm"
								onClick={() => onViewModeChange("detailed")}
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

interface PhotoModerationCardProps {
	photo: any;
	onModerate: (
		photoId: string,
		action: "approve" | "reject",
		reason?: string,
	) => void;
	viewMode: "grid" | "detailed";
	isSelected?: boolean;
	onSelect?: (selected: boolean) => void;
}

function PhotoModerationCard({
	photo,
	onModerate,
	viewMode,
	isSelected = false,
	onSelect,
}: PhotoModerationCardProps) {
	const [showDetailModal, setShowDetailModal] = useState(false);
	const [showRejectModal, setShowRejectModal] = useState(false);
	const [rejectionReason, setRejectionReason] = useState("");

	const handleReject = () => {
		onModerate(photo.id, "reject", rejectionReason);
		setShowRejectModal(false);
		setRejectionReason("");
	};

	if (viewMode === "detailed") {
		return (
			<>
				<Card
					className={`transition-all hover:shadow-md ${isSelected ? "ring-2 ring-blue-500" : ""}`}
				>
					<CardContent className="p-4">
						<div className="flex gap-4">
							{onSelect && (
								<Checkbox
									checked={isSelected}
									onCheckedChange={onSelect}
									className="mt-1"
								/>
							)}

							<div className="w-20 h-20 rounded-md overflow-hidden bg-gray-200 flex-shrink-0">
								<img
									src={photo.filePath}
									alt={photo.title}
									className="w-full h-full object-cover cursor-pointer"
									onClick={() => setShowDetailModal(true)}
								/>
							</div>

							<div className="flex-1 min-w-0">
								<div className="flex items-start justify-between">
									<div className="flex-1 min-w-0">
										<h3 className="font-medium truncate">{photo.title}</h3>
										<div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
											<div className="flex items-center gap-1">
												<User className="w-3 h-3" />
												<span>{photo.photographer?.name}</span>
											</div>
											<div className="flex items-center gap-1">
												<Camera className="w-3 h-3" />
												<span>{photo.competition?.title}</span>
											</div>
											<div className="flex items-center gap-1">
												<Calendar className="w-3 h-3" />
												<span>
													{format(new Date(photo.createdAt), "MMM dd, HH:mm")}
												</span>
											</div>
										</div>

										{photo.reports && photo.reports.length > 0 && (
											<div className="flex items-center gap-1 mt-2">
												<Flag className="w-3 h-3 text-red-500" />
												<span className="text-sm text-red-600">
													{photo.reports.length} report
													{photo.reports.length !== 1 ? "s" : ""}
												</span>
											</div>
										)}
									</div>

									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="sm">
												<MoreHorizontal className="w-4 h-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem
												onClick={() => setShowDetailModal(true)}
											>
												<Eye className="w-4 h-4 mr-2" />
												View Details
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												onClick={() => onModerate(photo.id, "approve")}
												className="text-green-600"
											>
												<CheckCircle className="w-4 h-4 mr-2" />
												Approve
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => setShowRejectModal(true)}
												className="text-red-600"
											>
												<XCircle className="w-4 h-4 mr-2" />
												Reject
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</div>
						</div>

						<div className="flex gap-2 mt-4">
							<Button
								size="sm"
								onClick={() => onModerate(photo.id, "approve")}
								className="flex-1"
							>
								<CheckCircle className="w-3 h-3 mr-1" />
								Approve
							</Button>
							<Button
								size="sm"
								variant="destructive"
								onClick={() => setShowRejectModal(true)}
								className="flex-1"
							>
								<XCircle className="w-3 h-3 mr-1" />
								Reject
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Rejection Modal */}
				<Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Reject Photo</DialogTitle>
							<DialogDescription>
								Please provide a reason for rejecting this photo submission.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<div>
								<Label htmlFor="reason">Rejection Reason</Label>
								<Textarea
									id="reason"
									value={rejectionReason}
									onChange={(e) => setRejectionReason(e.target.value)}
									placeholder="Explain why this photo is being rejected..."
									rows={3}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setShowRejectModal(false)}
							>
								Cancel
							</Button>
							<Button variant="destructive" onClick={handleReject}>
								Reject Photo
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</>
		);
	}

	// Grid view
	return (
		<>
			<Card
				className={`transition-all hover:shadow-md ${isSelected ? "ring-2 ring-blue-500" : ""}`}
			>
				<div className="relative">
					{onSelect && (
						<Checkbox
							checked={isSelected}
							onCheckedChange={onSelect}
							className="absolute top-2 left-2 z-10 bg-white shadow-sm"
						/>
					)}

					{photo.reports && photo.reports.length > 0 && (
						<Badge
							variant="destructive"
							className="absolute top-2 right-2 z-10"
						>
							<Flag className="w-3 h-3 mr-1" />
							{photo.reports.length}
						</Badge>
					)}

					<div className="aspect-square overflow-hidden rounded-t-lg">
						<img
							src={photo.filePath}
							alt={photo.title}
							className="w-full h-full object-cover cursor-pointer"
							onClick={() => setShowDetailModal(true)}
						/>
					</div>
				</div>

				<CardContent className="p-4">
					<div className="space-y-3">
						<div>
							<h3 className="font-medium truncate">{photo.title}</h3>
							<p className="text-sm text-gray-600">
								by {photo.photographer?.name}
							</p>
						</div>

						<div className="flex items-center gap-2 text-xs text-gray-500">
							<Calendar className="w-3 h-3" />
							{format(new Date(photo.createdAt), "MMM dd, HH:mm")}
						</div>

						<Badge variant="outline" className="text-xs">
							{photo.competition?.title}
						</Badge>

						<div className="flex gap-2">
							<Button
								size="sm"
								onClick={() => onModerate(photo.id, "approve")}
								className="flex-1"
							>
								<CheckCircle className="w-3 h-3 mr-1" />
								Approve
							</Button>
							<Button
								size="sm"
								variant="destructive"
								onClick={() => setShowRejectModal(true)}
								className="flex-1"
							>
								<XCircle className="w-3 h-3 mr-1" />
								Reject
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Rejection Modal */}
			<Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Reject Photo</DialogTitle>
						<DialogDescription>
							Please provide a reason for rejecting this photo submission.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<Label htmlFor="reason">Rejection Reason</Label>
							<Textarea
								id="reason"
								value={rejectionReason}
								onChange={(e) => setRejectionReason(e.target.value)}
								placeholder="Explain why this photo is being rejected..."
								rows={3}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowRejectModal(false)}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleReject}>
							Reject Photo
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

interface BulkModerationActionsProps {
	selectedCount: number;
	onBulkApprove: () => void;
	onBulkReject: () => void;
	onClearSelection: () => void;
}

function BulkModerationActions({
	selectedCount,
	onBulkApprove,
	onBulkReject,
	onClearSelection,
}: BulkModerationActionsProps) {
	return (
		<Card className="border-blue-200 bg-blue-50">
			<CardContent className="p-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<span className="text-sm font-medium">
							{selectedCount} photo{selectedCount !== 1 ? "s" : ""} selected
						</span>
						<div className="flex gap-2">
							<Button size="sm" onClick={onBulkApprove}>
								<CheckCircle className="w-4 h-4 mr-2" />
								Approve All
							</Button>
							<Button variant="destructive" size="sm" onClick={onBulkReject}>
								<XCircle className="w-4 h-4 mr-2" />
								Reject All
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

export default function ModerationQueue() {
	const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
	const [filterCategory, setFilterCategory] = useState<string | null>(null);
	const [sortBy, setSortBy] = useState<string>("date");
	const [searchQuery, setSearchQuery] = useState("");
	const [viewMode, setViewMode] = useState<"grid" | "detailed">("grid");

	const { data: pendingPhotos, isLoading } = usePendingPhotos({
		categoryId: filterCategory,
		sort: sortBy,
		search: searchQuery,
	});

	const { data: stats } = useModerationStats();
	const moderateMutation = useModeratePhoto();
	const bulkModerateMutation = useBulkModeratePhotos();
	const { toggleItem, toggleAll, isSelected, clearSelection } =
		useBulkActions();

	const handleModerate = async (
		photoId: string,
		action: "approve" | "reject",
		reason?: string,
	) => {
		await moderateMutation.mutateAsync({
			photoId,
			action,
			reason,
		});
	};

	const handleBulkModerate = async (action: "approve" | "reject") => {
		await bulkModerateMutation.mutateAsync({
			photoIds: selectedPhotos,
			action,
		});
		clearSelection();
		setSelectedPhotos([]);
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-semibold flex items-center gap-2">
						<Shield className="w-6 h-6" />
						Content Moderation
					</h1>
					<p className="text-gray-600">Review and moderate photo submissions</p>
				</div>
			</div>

			<ModerationStats stats={stats} />

			<ModerationFilters
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				filterCategory={filterCategory}
				onCategoryChange={setFilterCategory}
				sortBy={sortBy}
				onSortChange={setSortBy}
				viewMode={viewMode}
				onViewModeChange={setViewMode}
			/>

			{isLoading ? (
				<div
					className={
						viewMode === "grid"
							? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
							: "space-y-4"
					}
				>
					{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
						<Card key={i} className="animate-pulse">
							<div className="aspect-square bg-gray-200" />
							<CardContent className="p-4">
								<div className="space-y-2">
									<div className="h-4 bg-gray-200 rounded" />
									<div className="h-3 bg-gray-200 rounded w-2/3" />
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : pendingPhotos && pendingPhotos.length > 0 ? (
				<div
					className={
						viewMode === "grid"
							? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
							: "space-y-4"
					}
				>
					{pendingPhotos.map((photo) => (
						<PhotoModerationCard
							key={photo.id}
							photo={photo}
							onModerate={handleModerate}
							viewMode={viewMode}
							isSelected={isSelected(photo.id)}
							onSelect={(selected) => {
								if (selected) {
									setSelectedPhotos((prev) => [...prev, photo.id]);
								} else {
									setSelectedPhotos((prev) =>
										prev.filter((id) => id !== photo.id),
									);
								}
								toggleItem(photo.id);
							}}
						/>
					))}
				</div>
			) : (
				<Card>
					<CardContent className="p-12 text-center">
						<CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							All caught up!
						</h3>
						<p className="text-gray-500">
							No photos pending moderation at the moment.
						</p>
					</CardContent>
				</Card>
			)}

			{selectedPhotos.length > 0 && (
				<BulkModerationActions
					selectedCount={selectedPhotos.length}
					onBulkApprove={() => handleBulkModerate("approve")}
					onBulkReject={() => handleBulkModerate("reject")}
					onClearSelection={() => {
						clearSelection();
						setSelectedPhotos([]);
					}}
				/>
			)}
		</div>
	);
}
