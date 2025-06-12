import {
	Calendar,
	Camera,
	ChevronLeft,
	ChevronRight,
	MapPin,
	User,
	X,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import { cn } from "~/lib/utils";
import { VoteButton } from "./vote-button";

interface Photo {
	id: string;
	title: string;
	filePath: string;
	voteCount: number;
	userHasVoted: boolean;
	canVote: boolean;
	status: "pending" | "approved" | "rejected";
	photographer: {
		id: string;
		name: string;
	};
	category: {
		id: string;
		name: string;
	};
	location?: string;
	description?: string;
	dateTaken?: string;
	cameraInfo?: string;
	settings?: string;
	createdAt?: string;
}

interface PhotoDetailModalProps {
	photo: Photo | null;
	isOpen: boolean;
	onClose: () => void;
	onNavigate: (direction: "prev" | "next") => void;
	competitionStatus: "open" | "voting" | "closed";
}

export function PhotoDetailModal({
	photo,
	isOpen,
	onClose,
	onNavigate,
	competitionStatus,
}: PhotoDetailModalProps) {
	if (!photo) return null;

	const formatDate = (dateString?: string) => {
		if (!dateString) return null;
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-7xl w-full h-[90vh] p-0 overflow-hidden">
				<div className="grid grid-cols-1 lg:grid-cols-3 h-full">
					{/* Image Section */}
					<div className="lg:col-span-2 relative bg-black flex items-center justify-center">
						{/* Navigation Buttons */}
						<Button
							variant="ghost"
							size="lg"
							onClick={() => onNavigate("prev")}
							className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
						>
							<ChevronLeft className="w-6 h-6" />
						</Button>

						<Button
							variant="ghost"
							size="lg"
							onClick={() => onNavigate("next")}
							className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
						>
							<ChevronRight className="w-6 h-6" />
						</Button>

						{/* Close Button */}
						<Button
							variant="ghost"
							size="sm"
							onClick={onClose}
							className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
						>
							<X className="w-5 h-5" />
						</Button>

						{/* Main Image */}
						<img
							src={photo.filePath}
							alt={photo.title}
							className="max-w-full max-h-full object-contain"
						/>
					</div>

					{/* Details Section */}
					<div className="p-6 space-y-6 overflow-y-auto bg-white">
						{/* Header */}
						<div className="space-y-4">
							<div>
								<h2 className="text-2xl font-bold text-gray-900 mb-2">
									{photo.title}
								</h2>
								<div className="flex items-center gap-2 text-sm text-gray-600">
									<User className="w-4 h-4" />
									<span>by {photo.photographer.name}</span>
								</div>
								<div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
									<span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
										{photo.category.name}
									</span>
								</div>
							</div>

							{/* Voting Section */}
							{competitionStatus === "voting" && (
								<div className="border rounded-lg p-4 bg-gray-50">
									<VoteButton
										photoId={photo.id}
										currentVotes={photo.voteCount}
										userHasVoted={photo.userHasVoted}
										canVote={photo.canVote}
										competitionStatus={competitionStatus}
										variant="card"
										size="lg"
									/>
								</div>
							)}

							{/* Vote Display for non-voting periods */}
							{competitionStatus !== "voting" && (
								<div className="flex items-center gap-2 text-lg">
									<span className="font-semibold">{photo.voteCount}</span>
									<span className="text-gray-600">
										{photo.voteCount === 1 ? "vote" : "votes"}
									</span>
								</div>
							)}
						</div>

						{/* Description */}
						{photo.description && (
							<div>
								<h3 className="text-lg font-semibold mb-2">Description</h3>
								<p className="text-gray-700 leading-relaxed">
									{photo.description}
								</p>
							</div>
						)}

						{/* Photo Details */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold">Photo Details</h3>

							<div className="space-y-3">
								{photo.location && (
									<div className="flex items-center gap-3">
										<MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
										<span className="text-gray-700">{photo.location}</span>
									</div>
								)}

								{photo.dateTaken && (
									<div className="flex items-center gap-3">
										<Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
										<span className="text-gray-700">
											{formatDate(photo.dateTaken)}
										</span>
									</div>
								)}

								{photo.cameraInfo && (
									<div className="flex items-start gap-3">
										<Camera className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
										<div>
											<div className="text-gray-700">{photo.cameraInfo}</div>
											{photo.settings && (
												<div className="text-sm text-gray-500 mt-1">
													{photo.settings}
												</div>
											)}
										</div>
									</div>
								)}

								{photo.createdAt && (
									<div className="flex items-center gap-3">
										<Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
										<div>
											<div className="text-gray-700">
												Submitted {formatDate(photo.createdAt)}
											</div>
										</div>
									</div>
								)}
							</div>
						</div>

						{/* Photographer Info */}
						<div className="border-t pt-4">
							<h3 className="text-lg font-semibold mb-3">Photographer</h3>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
									<User className="w-5 h-5 text-gray-500" />
								</div>
								<div>
									<div className="font-medium text-gray-900">
										{photo.photographer.name}
									</div>
									<div className="text-sm text-gray-500">Photographer</div>
								</div>
							</div>
						</div>

						{/* Competition Status Info */}
						<div className="border-t pt-4">
							<div className="text-sm text-gray-500">
								{competitionStatus === "open" && (
									<p>Voting for this competition hasn't started yet.</p>
								)}
								{competitionStatus === "voting" && (
									<p>Voting is currently open for this competition.</p>
								)}
								{competitionStatus === "closed" && (
									<p>Voting for this competition has ended.</p>
								)}
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

// Navigation buttons component for reuse
interface NavigationButtonProps {
	direction: "prev" | "next";
	onClick: () => void;
	className?: string;
}

export function NavigationButton({
	direction,
	onClick,
	className,
}: NavigationButtonProps) {
	return (
		<Button
			variant="ghost"
			size="lg"
			onClick={onClick}
			className={cn(
				"bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-all",
				className,
			)}
		>
			{direction === "prev" ? (
				<ChevronLeft className="w-6 h-6" />
			) : (
				<ChevronRight className="w-6 h-6" />
			)}
		</Button>
	);
}

// Photo metadata component for reuse
interface PhotoMetadataProps {
	photo: Photo;
	showVoting?: boolean;
}

export function PhotoMetadata({
	photo,
	showVoting = false,
}: PhotoMetadataProps) {
	const formatDate = (dateString?: string) => {
		if (!dateString) return null;
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	return (
		<div className="space-y-4">
			<div>
				<h3 className="text-xl font-bold mb-2">{photo.title}</h3>
				<div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
					<User className="w-4 h-4" />
					<span>by {photo.photographer.name}</span>
				</div>
				<span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
					{photo.category.name}
				</span>
			</div>

			{photo.description && (
				<div>
					<h4 className="font-medium mb-1">Description</h4>
					<p className="text-gray-700 text-sm">{photo.description}</p>
				</div>
			)}

			<div className="space-y-2 text-sm">
				{photo.location && (
					<div className="flex items-center gap-2">
						<MapPin className="w-4 h-4 text-gray-400" />
						<span>{photo.location}</span>
					</div>
				)}
				{photo.dateTaken && (
					<div className="flex items-center gap-2">
						<Calendar className="w-4 h-4 text-gray-400" />
						<span>{formatDate(photo.dateTaken)}</span>
					</div>
				)}
				{photo.cameraInfo && (
					<div className="flex items-center gap-2">
						<Camera className="w-4 h-4 text-gray-400" />
						<span>{photo.cameraInfo}</span>
					</div>
				)}
			</div>
		</div>
	);
}
