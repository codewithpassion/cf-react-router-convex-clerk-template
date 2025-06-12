import {
	Award,
	Crown,
	Heart,
	Medal,
	TrendingUp,
	Trophy,
	User,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { useRealtimeLeaderboard } from "~/hooks/use-realtime-votes";
import { cn } from "~/lib/utils";

interface LeaderboardEntry {
	id: string;
	title: string;
	filePath: string;
	voteCount: number;
	photographer: {
		id: string;
		name: string;
	};
	category?: {
		id: string;
		name: string;
	};
	change?: number; // Position change from previous period
	trend?: "up" | "down" | "same";
}

interface LeaderboardProps {
	competitionId: string;
	categoryId?: string;
	limit?: number;
	showPhotos?: boolean;
	variant?: "full" | "compact" | "mini";
	showTrends?: boolean;
	className?: string;
}

export function Leaderboard({
	competitionId,
	categoryId,
	limit = 10,
	showPhotos = true,
	variant = "full",
	showTrends = false,
	className,
}: LeaderboardProps) {
	const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(
		null,
	);

	// Real-time leaderboard updates
	const { leaderboard } = useRealtimeLeaderboard(competitionId, categoryId);
	const isLoading = !leaderboard;

	// Limit the results
	const limitedLeaderboard = leaderboard?.slice(0, limit) || [];

	if (isLoading) return <LeaderboardSkeleton variant={variant} />;

	if (limitedLeaderboard.length === 0) {
		return (
			<Card className={className}>
				<CardContent className="text-center py-12">
					<Trophy className="w-12 h-12 mx-auto text-gray-400 mb-4" />
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						No entries yet
					</h3>
					<p className="text-gray-500">
						Be the first to vote and see the leaderboard!
					</p>
				</CardContent>
			</Card>
		);
	}

	if (variant === "mini") {
		return (
			<Card className={className}>
				<CardHeader className="pb-3">
					<CardTitle className="text-lg flex items-center gap-2">
						<Trophy className="w-5 h-5 text-amber-500" />
						Top Photos
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					{limitedLeaderboard.slice(0, 3).map((entry, index) => (
						<div key={entry.id} className="flex items-center gap-3">
							<div className="flex-shrink-0">{getRankIcon(index + 1)}</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium truncate">{entry.title}</p>
								<p className="text-xs text-gray-500">
									by {entry.photographer.name}
								</p>
							</div>
							<div className="flex items-center gap-1 text-sm">
								<Heart className="w-3 h-3 text-red-500" />
								<span className="font-medium">{entry.voteCount}</span>
							</div>
						</div>
					))}
					{limitedLeaderboard.length > 3 && (
						<Button variant="outline" size="sm" className="w-full mt-3" asChild>
							<Link to={`/competitions/${competitionId}/leaderboard`}>
								View Full Leaderboard
							</Link>
						</Button>
					)}
				</CardContent>
			</Card>
		);
	}

	if (variant === "compact") {
		return (
			<div className={cn("space-y-2", className)}>
				{limitedLeaderboard.map((entry, index) => (
					<CompactLeaderboardEntry
						key={entry.id}
						entry={entry}
						rank={index + 1}
						showPhoto={showPhotos}
						showTrend={showTrends}
						onClick={() => setSelectedEntry(entry)}
					/>
				))}
			</div>
		);
	}

	// Full variant
	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Trophy className="w-5 h-5 text-amber-500" />
						<span>Leaderboard</span>
					</div>
					<div className="text-sm text-gray-500">
						{limitedLeaderboard.length} entries
					</div>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Top 3 Podium */}
				{limitedLeaderboard.length >= 3 && (
					<div className="grid grid-cols-3 gap-4 mb-6">
						{/* Second Place */}
						<PodiumEntry entry={limitedLeaderboard[1]} rank={2} />
						{/* First Place */}
						<PodiumEntry entry={limitedLeaderboard[0]} rank={1} />
						{/* Third Place */}
						<PodiumEntry entry={limitedLeaderboard[2]} rank={3} />
					</div>
				)}

				{/* Remaining entries */}
				<div className="space-y-2">
					{limitedLeaderboard
						.slice(limitedLeaderboard.length >= 3 ? 3 : 0)
						.map((entry, index) => (
							<LeaderboardEntry
								key={entry.id}
								entry={entry}
								rank={index + (limitedLeaderboard.length >= 3 ? 4 : 1)}
								showPhoto={showPhotos}
								showTrend={showTrends}
								onClick={() => setSelectedEntry(entry)}
							/>
						))}
				</div>
			</CardContent>
		</Card>
	);
}

// Individual leaderboard entry component
interface LeaderboardEntryProps {
	entry: LeaderboardEntry;
	rank: number;
	showPhoto?: boolean;
	showTrend?: boolean;
	onClick?: () => void;
}

function LeaderboardEntry({
	entry,
	rank,
	showPhoto = true,
	showTrend = false,
	onClick,
}: LeaderboardEntryProps) {
	return (
		<div
			className={cn(
				"flex items-center gap-4 p-3 rounded-lg transition-colors",
				onClick ? "hover:bg-gray-50 cursor-pointer" : "",
				rank <= 3
					? "bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200"
					: "bg-white border",
			)}
			onClick={onClick}
			onKeyUp={
				onClick
					? (e) => {
							if (e.key === "Enter" || e.key === " ") onClick();
						}
					: undefined
			}
			tabIndex={onClick ? 0 : undefined}
			role={onClick ? "button" : undefined}
		>
			{/* Rank */}
			<div className="flex-shrink-0 w-8 text-center">
				{rank <= 3 ? (
					getRankIcon(rank)
				) : (
					<span className="font-bold text-gray-500">#{rank}</span>
				)}
			</div>

			{/* Photo thumbnail */}
			{showPhoto && (
				<div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-gray-100">
					<img
						src={entry.filePath}
						alt={entry.title}
						className="w-full h-full object-cover"
					/>
				</div>
			)}

			{/* Entry details */}
			<div className="flex-1 min-w-0">
				<h4 className="font-medium text-gray-900 truncate">{entry.title}</h4>
				<div className="flex items-center gap-2 text-sm text-gray-500">
					<User className="w-3 h-3" />
					<span>by {entry.photographer.name}</span>
					{entry.category && (
						<>
							<span>•</span>
							<span>{entry.category.name}</span>
						</>
					)}
				</div>
			</div>

			{/* Trend indicator */}
			{showTrend && entry.trend && (
				<div className="flex-shrink-0">
					{entry.trend === "up" && (
						<div className="flex items-center gap-1 text-green-600">
							<TrendingUp className="w-4 h-4" />
							{entry.change && <span className="text-xs">+{entry.change}</span>}
						</div>
					)}
					{entry.trend === "down" && (
						<div className="flex items-center gap-1 text-red-600">
							<TrendingUp className="w-4 h-4 rotate-180" />
							{entry.change && <span className="text-xs">-{entry.change}</span>}
						</div>
					)}
				</div>
			)}

			{/* Vote count */}
			<div className="flex-shrink-0 flex items-center gap-2">
				<Heart className="w-4 h-4 text-red-500" />
				<span className="font-bold text-lg">{entry.voteCount}</span>
			</div>
		</div>
	);
}

// Compact entry variant
function CompactLeaderboardEntry({
	entry,
	rank,
	showPhoto = true,
	showTrend = false,
	onClick,
}: LeaderboardEntryProps) {
	return (
		<div
			className={cn(
				"flex items-center gap-3 p-2 rounded transition-colors",
				onClick ? "hover:bg-gray-50 cursor-pointer" : "",
				rank <= 3 ? "bg-amber-50" : "bg-white",
			)}
			onClick={onClick}
			onKeyUp={
				onClick
					? (e) => {
							if (e.key === "Enter" || e.key === " ") onClick();
						}
					: undefined
			}
			tabIndex={onClick ? 0 : undefined}
			role={onClick ? "button" : undefined}
		>
			<div className="flex-shrink-0">
				{rank <= 3 ? (
					getRankIcon(rank, "sm")
				) : (
					<span className="font-medium text-sm">#{rank}</span>
				)}
			</div>

			{showPhoto && (
				<div className="flex-shrink-0 w-8 h-8 rounded overflow-hidden bg-gray-100">
					<img
						src={entry.filePath}
						alt={entry.title}
						className="w-full h-full object-cover"
					/>
				</div>
			)}

			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium truncate">{entry.title}</p>
				<p className="text-xs text-gray-500">{entry.photographer.name}</p>
			</div>

			{showTrend && entry.trend && (
				<div className="flex-shrink-0">
					{entry.trend === "up" && (
						<TrendingUp className="w-3 h-3 text-green-500" />
					)}
					{entry.trend === "down" && (
						<TrendingUp className="w-3 h-3 text-red-500 rotate-180" />
					)}
				</div>
			)}

			<div className="flex items-center gap-1 text-sm">
				<Heart className="w-3 h-3 text-red-500" />
				<span className="font-medium">{entry.voteCount}</span>
			</div>
		</div>
	);
}

// Podium entry for top 3
interface PodiumEntryProps {
	entry: LeaderboardEntry;
	rank: 1 | 2 | 3;
}

function PodiumEntry({ entry, rank }: PodiumEntryProps) {
	const heights = { 1: "h-32", 2: "h-24", 3: "h-20" };
	const bgColors = { 1: "bg-amber-100", 2: "bg-gray-100", 3: "bg-orange-100" };

	return (
		<div
			className={cn(
				"text-center",
				rank === 1 ? "order-2" : rank === 2 ? "order-1" : "order-3",
			)}
		>
			<div
				className={cn(
					"rounded-lg p-4 mb-2",
					bgColors[rank],
					heights[rank],
					"flex flex-col justify-end",
				)}
			>
				<div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-2 border-2 border-white shadow-lg">
					<img
						src={entry.filePath}
						alt={entry.title}
						className="w-full h-full object-cover"
					/>
				</div>
				<div className="mb-2">{getRankIcon(rank)}</div>
			</div>
			<h4 className="font-medium text-sm truncate">{entry.title}</h4>
			<p className="text-xs text-gray-500">{entry.photographer.name}</p>
			<div className="flex items-center justify-center gap-1 mt-1">
				<Heart className="w-3 h-3 text-red-500" />
				<span className="font-bold text-sm">{entry.voteCount}</span>
			</div>
		</div>
	);
}

// Helper function to get rank icons
function getRankIcon(rank: number, size: "sm" | "md" = "md") {
	const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

	switch (rank) {
		case 1:
			return <Crown className={cn(iconSize, "text-amber-500")} />;
		case 2:
			return <Medal className={cn(iconSize, "text-gray-500")} />;
		case 3:
			return <Award className={cn(iconSize, "text-orange-500")} />;
		default:
			return <span className="font-bold text-gray-500">#{rank}</span>;
	}
}

// Loading skeleton
function LeaderboardSkeleton({ variant }: { variant: string }) {
	if (variant === "mini") {
		return (
			<Card>
				<CardHeader className="pb-3">
					<Skeleton className="h-6 w-32" />
				</CardHeader>
				<CardContent className="space-y-3">
					{Array.from({ length: 3 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						<div key={i} className="flex items-center gap-3">
							<Skeleton className="w-6 h-6 rounded" />
							<div className="flex-1 space-y-1">
								<Skeleton className="h-4 w-3/4" />
								<Skeleton className="h-3 w-1/2" />
							</div>
							<Skeleton className="h-4 w-8" />
						</div>
					))}
				</CardContent>
			</Card>
		);
	}

	if (variant === "compact") {
		return (
			<div className="space-y-2">
				{Array.from({ length: 5 }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					<div key={i} className="flex items-center gap-3 p-2">
						<Skeleton className="w-6 h-6 rounded" />
						<Skeleton className="w-8 h-8 rounded" />
						<div className="flex-1 space-y-1">
							<Skeleton className="h-4 w-3/4" />
							<Skeleton className="h-3 w-1/2" />
						</div>
						<Skeleton className="h-4 w-8" />
					</div>
				))}
			</div>
		);
	}

	// Full variant skeleton
	return (
		<Card>
			<CardHeader>
				<Skeleton className="h-6 w-48" />
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-3 gap-4 mb-6">
					{Array.from({ length: 3 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						<div key={`item-${i}`} className="text-center">
							<Skeleton className="h-24 w-full rounded-lg mb-2" />
							<Skeleton className="h-4 w-3/4 mx-auto mb-1" />
							<Skeleton className="h-3 w-1/2 mx-auto" />
						</div>
					))}
				</div>
				{Array.from({ length: 5 }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					<div key={`item-${i}`} className="flex items-center gap-4 p-3">
						<Skeleton className="w-8 h-8 rounded" />
						<Skeleton className="w-12 h-12 rounded" />
						<div className="flex-1 space-y-2">
							<Skeleton className="h-4 w-3/4" />
							<Skeleton className="h-3 w-1/2" />
						</div>
						<Skeleton className="h-6 w-12" />
					</div>
				))}
			</CardContent>
		</Card>
	);
}
