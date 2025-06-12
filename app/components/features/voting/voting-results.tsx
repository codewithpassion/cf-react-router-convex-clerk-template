import {
	Award,
	Calendar,
	Crown,
	Medal,
	Star,
	Trophy,
	Users,
	Vote,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

interface Winner {
	rank: number;
	photo: {
		id: string;
		title: string;
		filePath: string;
		description?: string;
		photographer: {
			id: string;
			name: string;
		};
	};
	votes: number;
	category: {
		id: string;
		name: string;
	};
	prize?: string;
}

interface CategoryResults {
	id: string;
	name: string;
	results: Winner[];
}

interface VotingResults {
	winners: Winner[];
	categories: CategoryResults[];
	totalVotes: number;
	totalParticipants: number;
	votingPeriod: {
		start: string;
		end: string;
	};
}

interface VotingResultsProps {
	competitionId: string;
	showWinners?: boolean;
	categoryId?: string;
	className?: string;
}

export function VotingResults({
	competitionId,
	showWinners = true,
	categoryId,
	className,
}: VotingResultsProps) {
	const [selectedWinner, setSelectedWinner] = useState<Winner | null>(null);

	// Mock data - replace with actual tRPC call
	const isLoading = false;
	const results: VotingResults = {
		winners: [
			{
				rank: 1,
				photo: {
					id: "winner-1",
					title: "Golden Hour Landscape",
					filePath:
						"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600",
					description: "A breathtaking sunset over mountain peaks",
					photographer: { id: "user-1", name: "John Doe" },
				},
				votes: 247,
				category: { id: "landscape", name: "Landscape" },
				prize: "First Place - $500 + Gallery Exhibition",
			},
			{
				rank: 2,
				photo: {
					id: "winner-2",
					title: "Street Life",
					filePath:
						"https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600",
					description: "Capturing the essence of urban life",
					photographer: { id: "user-2", name: "Jane Smith" },
				},
				votes: 198,
				category: { id: "street", name: "Street Photography" },
				prize: "Second Place - $300 + Equipment",
			},
			{
				rank: 3,
				photo: {
					id: "winner-3",
					title: "Wildlife Portrait",
					filePath:
						"https://images.unsplash.com/photo-1518467166778-b88f373ffec7?w=600",
					description: "An intimate moment with nature",
					photographer: { id: "user-3", name: "Mike Wilson" },
				},
				votes: 156,
				category: { id: "wildlife", name: "Wildlife" },
				prize: "Third Place - $100 + Certificate",
			},
		],
		categories: [
			{
				id: "landscape",
				name: "Landscape",
				results: [
					{
						rank: 1,
						photo: {
							id: "landscape-1",
							title: "Golden Hour Landscape",
							filePath:
								"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
							photographer: { id: "user-1", name: "John Doe" },
						},
						votes: 247,
						category: { id: "landscape", name: "Landscape" },
					},
					{
						rank: 2,
						photo: {
							id: "landscape-2",
							title: "Mountain Vista",
							filePath:
								"https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400",
							photographer: { id: "user-4", name: "Sarah Johnson" },
						},
						votes: 189,
						category: { id: "landscape", name: "Landscape" },
					},
				],
			},
		],
		totalVotes: 1247,
		totalParticipants: 89,
		votingPeriod: {
			start: "2024-03-01T00:00:00Z",
			end: "2024-03-15T23:59:59Z",
		},
	};

	if (isLoading) return <ResultsSkeleton />;

	return (
		<div className={cn("space-y-8", className)}>
			{/* Winners Section */}
			{showWinners && results?.winners && (
				<WinnersSection
					winners={results.winners}
					onWinnerClick={setSelectedWinner}
				/>
			)}

			{/* Category Results */}
			<div className="space-y-6">
				<h3 className="text-2xl font-semibold">Final Results</h3>

				{results?.categories.map((category) => (
					<CategoryResults
						key={category.id}
						category={category}
						onPhotoClick={setSelectedWinner}
					/>
				))}
			</div>

			{/* Voting Statistics */}
			<VotingStatistics
				totalVotes={results?.totalVotes}
				totalParticipants={results?.totalParticipants}
				votingPeriod={results?.votingPeriod}
			/>

			{/* Winner Detail Modal */}
			{selectedWinner && (
				<WinnerDetailModal
					winner={selectedWinner}
					onClose={() => setSelectedWinner(null)}
				/>
			)}
		</div>
	);
}

// Winners section component
interface WinnersSectionProps {
	winners: Winner[];
	onWinnerClick?: (winner: Winner) => void;
}

export function WinnersSection({
	winners,
	onWinnerClick,
}: WinnersSectionProps) {
	return (
		<div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-8 rounded-xl border border-yellow-200">
			<div className="text-center mb-8">
				<Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
				<h2 className="text-3xl font-bold text-gray-900">
					Competition Winners
				</h2>
				<p className="text-gray-600 mt-2">
					Congratulations to our amazing photographers!
				</p>
			</div>

			{/* Top 3 Winners */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				{/* Second Place */}
				{winners[1] && (
					<WinnerCard
						winner={winners[1]}
						position="second"
						onClick={() => onWinnerClick?.(winners[1])}
					/>
				)}
				{/* First Place */}
				{winners[0] && (
					<WinnerCard
						winner={winners[0]}
						position="first"
						onClick={() => onWinnerClick?.(winners[0])}
					/>
				)}
				{/* Third Place */}
				{winners[2] && (
					<WinnerCard
						winner={winners[2]}
						position="third"
						onClick={() => onWinnerClick?.(winners[2])}
					/>
				)}
			</div>

			{/* Additional Winners */}
			{winners.length > 3 && (
				<div>
					<h3 className="text-xl font-semibold mb-4 text-center">
						Other Category Winners
					</h3>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{winners.slice(3).map((winner) => (
							<CompactWinnerCard
								key={winner.photo.id}
								winner={winner}
								onClick={() => onWinnerClick?.(winner)}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

// Individual winner card
interface WinnerCardProps {
	winner: Winner;
	position: "first" | "second" | "third";
	onClick?: () => void;
}

function WinnerCard({ winner, position, onClick }: WinnerCardProps) {
	const getRankIcon = () => {
		switch (position) {
			case "first":
				return <Crown className="w-8 h-8 text-yellow-500" />;
			case "second":
				return <Medal className="w-8 h-8 text-gray-500" />;
			case "third":
				return <Award className="w-8 h-8 text-orange-500" />;
		}
	};

	const getOrderClass = () => {
		switch (position) {
			case "first":
				return "order-2 md:scale-105";
			case "second":
				return "order-1";
			case "third":
				return "order-3";
		}
	};

	const getBgColor = () => {
		switch (position) {
			case "first":
				return "bg-gradient-to-b from-yellow-100 to-yellow-200";
			case "second":
				return "bg-gradient-to-b from-gray-100 to-gray-200";
			case "third":
				return "bg-gradient-to-b from-orange-100 to-orange-200";
		}
	};

	return (
		<div className={cn("text-center", getOrderClass())}>
			<Card
				className={cn(
					"cursor-pointer transition-all duration-200 hover:shadow-lg",
					getBgColor(),
				)}
				onClick={onClick}
			>
				<CardContent className="p-6">
					{/* Rank Icon */}
					<div className="flex justify-center mb-4">{getRankIcon()}</div>

					{/* Photo */}
					<div className="relative mb-4">
						<img
							src={winner.photo.filePath}
							alt={winner.photo.title}
							className="w-full h-48 object-cover rounded-lg"
						/>
						<div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-lg">
							<div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold text-sm">
								{winner.rank}
							</div>
						</div>
					</div>

					{/* Details */}
					<h3 className="font-bold text-lg mb-1">{winner.photo.title}</h3>
					<p className="text-gray-600 text-sm mb-2">
						by {winner.photo.photographer.name}
					</p>
					<p className="text-gray-500 text-xs mb-3">{winner.category.name}</p>

					{/* Vote Count */}
					<div className="flex items-center justify-center gap-1 mb-3">
						<Vote className="w-4 h-4 text-blue-500" />
						<span className="font-semibold">{winner.votes} votes</span>
					</div>

					{/* Prize */}
					{winner.prize && (
						<div className="bg-white bg-opacity-50 rounded-lg p-2">
							<p className="text-xs font-medium">{winner.prize}</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

// Compact winner card for additional winners
interface CompactWinnerCardProps {
	winner: Winner;
	onClick?: () => void;
}

function CompactWinnerCard({ winner, onClick }: CompactWinnerCardProps) {
	return (
		<Card
			className="cursor-pointer transition-all duration-200 hover:shadow-md"
			onClick={onClick}
		>
			<CardContent className="p-3">
				<div className="relative mb-2">
					<img
						src={winner.photo.filePath}
						alt={winner.photo.title}
						className="w-full h-24 object-cover rounded"
					/>
					<div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold">
						{winner.rank}
					</div>
				</div>
				<h4 className="font-medium text-sm mb-1 truncate">
					{winner.photo.title}
				</h4>
				<p className="text-xs text-gray-600 truncate">
					{winner.photo.photographer.name}
				</p>
				<div className="flex items-center justify-center gap-1 mt-1">
					<Vote className="w-3 h-3 text-blue-500" />
					<span className="text-xs font-medium">{winner.votes}</span>
				</div>
			</CardContent>
		</Card>
	);
}

// Category results component
interface CategoryResultsProps {
	category: CategoryResults;
	onPhotoClick?: (winner: Winner) => void;
}

function CategoryResults({ category, onPhotoClick }: CategoryResultsProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Star className="w-5 h-5 text-blue-500" />
					{category.name} Results
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{category.results.map((result) => (
						<div
							key={result.photo.id}
							className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
							onClick={() => onPhotoClick?.(result)}
						>
							{/* Rank */}
							<div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-sm">
								{result.rank}
							</div>

							{/* Photo */}
							<div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
								<img
									src={result.photo.filePath}
									alt={result.photo.title}
									className="w-full h-full object-cover"
								/>
							</div>

							{/* Details */}
							<div className="flex-1 min-w-0">
								<h4 className="font-medium truncate">{result.photo.title}</h4>
								<p className="text-sm text-gray-600">
									by {result.photo.photographer.name}
								</p>
							</div>

							{/* Votes */}
							<div className="flex items-center gap-1 text-sm">
								<Vote className="w-4 h-4 text-blue-500" />
								<span className="font-medium">{result.votes}</span>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

// Voting statistics component
interface VotingStatisticsProps {
	totalVotes?: number;
	totalParticipants?: number;
	votingPeriod?: {
		start: string;
		end: string;
	};
}

function VotingStatistics({
	totalVotes,
	totalParticipants,
	votingPeriod,
}: VotingStatisticsProps) {
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Competition Statistics</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 md:grid-cols-3 gap-6">
					{totalVotes && (
						<div className="text-center">
							<div className="text-3xl font-bold text-blue-600">
								{totalVotes}
							</div>
							<div className="text-sm text-gray-600">Total Votes</div>
						</div>
					)}

					{totalParticipants && (
						<div className="text-center">
							<div className="text-3xl font-bold text-green-600">
								{totalParticipants}
							</div>
							<div className="text-sm text-gray-600">Participants</div>
						</div>
					)}

					{votingPeriod && (
						<div className="text-center md:col-span-1 col-span-2">
							<div className="text-lg font-bold text-purple-600">
								{Math.ceil(
									(new Date(votingPeriod.end).getTime() -
										new Date(votingPeriod.start).getTime()) /
										(1000 * 60 * 60 * 24),
								)}{" "}
								Days
							</div>
							<div className="text-sm text-gray-600">
								Voting Period
								<div className="text-xs">
									{formatDate(votingPeriod.start)} -{" "}
									{formatDate(votingPeriod.end)}
								</div>
							</div>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

// Winner detail modal
interface WinnerDetailModalProps {
	winner: Winner;
	onClose: () => void;
}

function WinnerDetailModal({ winner, onClose }: WinnerDetailModalProps) {
	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
			<Card className="max-w-2xl w-full max-h-[80vh] overflow-auto">
				<CardHeader>
					<div className="flex justify-between items-start">
						<CardTitle className="flex items-center gap-2">
							<Trophy className="w-6 h-6 text-yellow-500" />
							Winner Details
						</CardTitle>
						<Button variant="ghost" size="sm" onClick={onClose}>
							×
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Winner badge */}
					<div className="text-center">
						<div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-medium">
							{winner.rank === 1 && <Crown className="w-5 h-5" />}
							{winner.rank === 2 && <Medal className="w-5 h-5" />}
							{winner.rank === 3 && <Award className="w-5 h-5" />}
							{winner.rank > 3 && <Star className="w-5 h-5" />}
							{winner.rank === 1 && "1st Place Winner"}
							{winner.rank === 2 && "2nd Place Winner"}
							{winner.rank === 3 && "3rd Place Winner"}
							{winner.rank > 3 && `${winner.rank}th Place Winner`}
						</div>
					</div>

					{/* Photo */}
					<img
						src={winner.photo.filePath}
						alt={winner.photo.title}
						className="w-full h-64 object-cover rounded-lg"
					/>

					{/* Details */}
					<div className="space-y-3">
						<div>
							<h3 className="text-xl font-bold">{winner.photo.title}</h3>
							<p className="text-gray-600">
								by {winner.photo.photographer.name}
							</p>
						</div>

						{winner.photo.description && (
							<p className="text-gray-700">{winner.photo.description}</p>
						)}

						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-500">
								Category: {winner.category.name}
							</span>
							<div className="flex items-center gap-1">
								<Vote className="w-4 h-4 text-blue-500" />
								<span className="font-medium">{winner.votes} votes</span>
							</div>
						</div>

						{winner.prize && (
							<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
								<h4 className="font-medium text-yellow-900">Prize</h4>
								<p className="text-yellow-800">{winner.prize}</p>
							</div>
						)}
					</div>

					{/* Actions */}
					<div className="flex gap-3">
						<Button variant="outline" asChild className="flex-1">
							<Link to={`/photographers/${winner.photo.photographer.id}`}>
								View Photographer
							</Link>
						</Button>
						<Button onClick={onClose} className="flex-1">
							Close
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

// Loading skeleton
function ResultsSkeleton() {
	return (
		<div className="space-y-8">
			{/* Winners skeleton */}
			<div className="bg-gray-50 p-8 rounded-xl">
				<div className="text-center mb-8">
					<Skeleton className="w-16 h-16 mx-auto mb-4" />
					<Skeleton className="h-8 w-64 mx-auto mb-2" />
					<Skeleton className="h-4 w-48 mx-auto" />
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{Array.from({ length: 3 }).map((_, i) => (
						<Card key={i}>
							<CardContent className="p-6 text-center">
								<Skeleton className="w-8 h-8 mx-auto mb-4" />
								<Skeleton className="w-full h-48 mb-4" />
								<Skeleton className="h-5 w-3/4 mx-auto mb-2" />
								<Skeleton className="h-4 w-1/2 mx-auto mb-3" />
								<Skeleton className="h-4 w-2/3 mx-auto" />
							</CardContent>
						</Card>
					))}
				</div>
			</div>

			{/* Category results skeleton */}
			<div className="space-y-6">
				<Skeleton className="h-8 w-48" />
				<Card>
					<CardContent className="p-6">
						{Array.from({ length: 5 }).map((_, i) => (
							<div key={i} className="flex items-center gap-4 p-3 mb-3">
								<Skeleton className="w-8 h-8 rounded-full" />
								<Skeleton className="w-16 h-16 rounded" />
								<div className="flex-1 space-y-2">
									<Skeleton className="h-4 w-3/4" />
									<Skeleton className="h-3 w-1/2" />
								</div>
								<Skeleton className="h-4 w-12" />
							</div>
						))}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
