import { motion } from "framer-motion";
import { Grid, List, Play } from "lucide-react";
import { useState } from "react";
import { PhotoCard } from "~/components/features/photos/photo-card";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

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
}

interface VotingGalleryProps {
	photos: Photo[];
	viewMode: "grid" | "slideshow" | "list";
	isLoading: boolean;
	onPhotoClick: (photo: Photo) => void;
	onVote?: (photoId: string, voted: boolean) => void;
	competitionStatus: "open" | "voting" | "closed";
	className?: string;
}

export function VotingGallery({
	photos,
	viewMode,
	isLoading,
	onPhotoClick,
	onVote,
	competitionStatus,
	className,
}: VotingGalleryProps) {
	const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

	if (isLoading) {
		return <VotingGallerySkeleton viewMode={viewMode} />;
	}

	if (photos.length === 0) {
		return (
			<div className="text-center py-16">
				<div className="max-w-md mx-auto">
					<div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
						<Grid className="w-8 h-8 text-gray-400" />
					</div>
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						No photos available
					</h3>
					<p className="text-gray-600">
						There are no photos available for voting in this competition yet.
					</p>
				</div>
			</div>
		);
	}

	if (viewMode === "grid") {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className={cn(
					"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
					className,
				)}
			>
				{photos.map((photo, index) => (
					<motion.div
						key={photo.id}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
					>
						<PhotoCard
							photo={photo}
							showVoting={competitionStatus === "voting"}
							onVote={onVote}
							onClick={() => onPhotoClick(photo)}
							className="h-full"
						/>
					</motion.div>
				))}
			</motion.div>
		);
	}

	if (viewMode === "list") {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className={cn("space-y-4", className)}
			>
				{photos.map((photo, index) => (
					<motion.div
						key={photo.id}
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: index * 0.05 }}
						className="bg-white rounded-lg border overflow-hidden hover:shadow-md transition-shadow"
					>
						<div className="flex flex-col md:flex-row">
							<div className="md:w-64 h-48 md:h-32 bg-gray-100">
								<img
									src={photo.filePath}
									alt={photo.title}
									className="w-full h-full object-cover cursor-pointer"
									onClick={() => onPhotoClick(photo)}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											onPhotoClick(photo);
										}
									}}
								/>
							</div>
							<div className="flex-1 p-4">
								<div className="flex justify-between items-start mb-2">
									<div>
										<h3
											className="font-semibold text-lg mb-1 cursor-pointer hover:text-blue-600 transition-colors"
											onClick={() => onPhotoClick(photo)}
											onKeyDown={(e) => {
												if (e.key === "Enter" || e.key === " ") {
													onPhotoClick(photo);
												}
											}}
										>
											{photo.title}
										</h3>
										<p className="text-sm text-gray-600">
											by {photo.photographer.name}
										</p>
										<p className="text-xs text-gray-500">
											{photo.category.name}
											{photo.location && ` • ${photo.location}`}
										</p>
									</div>
									{competitionStatus === "voting" && (
										<div className="flex items-center gap-2">
											<span className="text-sm font-medium">
												{photo.voteCount} votes
											</span>
											<Button
												variant={photo.userHasVoted ? "default" : "outline"}
												size="sm"
												onClick={() => onVote?.(photo.id, !photo.userHasVoted)}
												disabled={!photo.canVote}
											>
												{photo.userHasVoted ? "Voted" : "Vote"}
											</Button>
										</div>
									)}
								</div>
								{photo.description && (
									<p className="text-sm text-gray-600 line-clamp-2">
										{photo.description}
									</p>
								)}
							</div>
						</div>
					</motion.div>
				))}
			</motion.div>
		);
	}

	if (viewMode === "slideshow") {
		const currentPhoto = photos[currentSlideIndex];

		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className={cn("space-y-6", className)}
			>
				{/* Main slideshow */}
				<div className="relative bg-black rounded-lg overflow-hidden aspect-video">
					<img
						src={currentPhoto.filePath}
						alt={currentPhoto.title}
						className="w-full h-full object-contain cursor-pointer"
						onClick={() => onPhotoClick(currentPhoto)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								onPhotoClick(currentPhoto);
							}
						}}
					/>

					{/* Navigation */}
					<div className="absolute inset-0 flex items-center justify-between p-4">
						<Button
							variant="ghost"
							size="sm"
							onClick={() =>
								setCurrentSlideIndex(
									currentSlideIndex === 0
										? photos.length - 1
										: currentSlideIndex - 1,
								)
							}
							className="bg-black/50 text-white hover:bg-black/70"
						>
							←
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() =>
								setCurrentSlideIndex((currentSlideIndex + 1) % photos.length)
							}
							className="bg-black/50 text-white hover:bg-black/70"
						>
							→
						</Button>
					</div>

					{/* Photo counter */}
					<div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-sm">
						{currentSlideIndex + 1} / {photos.length}
					</div>
				</div>

				{/* Photo details */}
				<div className="bg-white rounded-lg border p-6">
					<div className="flex justify-between items-start mb-4">
						<div>
							<h3 className="text-xl font-semibold mb-1">
								{currentPhoto.title}
							</h3>
							<p className="text-gray-600">
								by {currentPhoto.photographer.name}
							</p>
							<p className="text-sm text-gray-500">
								{currentPhoto.category.name}
								{currentPhoto.location && ` • ${currentPhoto.location}`}
							</p>
						</div>
						{competitionStatus === "voting" && (
							<div className="flex items-center gap-4">
								<span className="text-lg font-medium">
									{currentPhoto.voteCount} votes
								</span>
								<Button
									variant={currentPhoto.userHasVoted ? "default" : "outline"}
									onClick={() =>
										onVote?.(currentPhoto.id, !currentPhoto.userHasVoted)
									}
									disabled={!currentPhoto.canVote}
								>
									{currentPhoto.userHasVoted ? "Voted" : "Vote"}
								</Button>
							</div>
						)}
					</div>
					{currentPhoto.description && (
						<p className="text-gray-700">{currentPhoto.description}</p>
					)}
				</div>

				{/* Thumbnail navigation */}
				<div className="flex gap-2 overflow-x-auto pb-2">
					{photos.map((photo, index) => (
						<button
							key={photo.id}
							type="button"
							onClick={() => setCurrentSlideIndex(index)}
							className={cn(
								"flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all",
								index === currentSlideIndex
									? "border-blue-500 opacity-100"
									: "border-gray-200 opacity-60 hover:opacity-80",
							)}
						>
							<img
								src={photo.filePath}
								alt={photo.title}
								className="w-full h-full object-cover"
							/>
						</button>
					))}
				</div>
			</motion.div>
		);
	}

	return null;
}

function VotingGallerySkeleton({ viewMode }: { viewMode: string }) {
	if (viewMode === "grid") {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{Array.from({ length: 6 }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					<div key={`skeleton-${i}`} className="space-y-3">
						<Skeleton className="h-48 w-full" />
						<Skeleton className="h-4 w-3/4" />
						<Skeleton className="h-3 w-1/2" />
					</div>
				))}
			</div>
		);
	}

	if (viewMode === "list") {
		return (
			<div className="space-y-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						key={`skeleton-${i}`}
						className="flex gap-4 bg-white p-4 rounded-lg border"
					>
						<Skeleton className="w-32 h-20 flex-shrink-0" />
						<div className="flex-1 space-y-2">
							<Skeleton className="h-4 w-1/3" />
							<Skeleton className="h-3 w-1/4" />
							<Skeleton className="h-3 w-1/2" />
						</div>
					</div>
				))}
			</div>
		);
	}

	if (viewMode === "slideshow") {
		return (
			<div className="space-y-6">
				<Skeleton className="w-full aspect-video" />
				<div className="bg-white rounded-lg border p-6">
					<Skeleton className="h-6 w-1/3 mb-2" />
					<Skeleton className="h-4 w-1/4 mb-4" />
					<Skeleton className="h-3 w-full" />
					<Skeleton className="h-3 w-3/4" />
				</div>
			</div>
		);
	}

	return null;
}

// View mode selector component
interface ViewModeSelectorProps {
	currentMode: "grid" | "slideshow" | "list";
	onModeChange: (mode: "grid" | "slideshow" | "list") => void;
}

export function ViewModeSelector({
	currentMode,
	onModeChange,
}: ViewModeSelectorProps) {
	const modes = [
		{ id: "grid" as const, label: "Grid", icon: Grid },
		{ id: "slideshow" as const, label: "Slideshow", icon: Play },
		{ id: "list" as const, label: "List", icon: List },
	];

	return (
		<div className="flex rounded-lg border bg-white p-1">
			{modes.map(({ id, label, icon: Icon }) => (
				<button
					key={id}
					type="button"
					onClick={() => onModeChange(id)}
					className={cn(
						"flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
						currentMode === id
							? "bg-blue-500 text-white"
							: "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
					)}
				>
					<Icon className="w-4 h-4" />
					<span className="hidden sm:inline">{label}</span>
				</button>
			))}
		</div>
	);
}
