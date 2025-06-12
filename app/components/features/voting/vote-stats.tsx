import {
	BarChart3,
	Clock,
	Heart,
	TrendingDown,
	TrendingUp,
	Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface VoteHistoryData {
	daily: Array<{ date: string; votes: number }>;
	hourly: Array<{ hour: number; votes: number }>;
}

interface VoteStatsProps {
	photoId: string;
	totalVotes: number;
	averageScore?: number;
	voteHistory?: VoteHistoryData;
	showChart?: boolean;
	showBreakdown?: boolean;
	rank?: number;
	totalPhotos?: number;
	className?: string;
}

export function VoteStats({
	photoId,
	totalVotes,
	averageScore,
	voteHistory,
	showChart = false,
	showBreakdown = false,
	rank,
	totalPhotos,
	className,
}: VoteStatsProps) {
	// Calculate vote velocity (votes in last 24 hours vs previous 24 hours)
	const getVoteVelocity = () => {
		if (!voteHistory?.daily || voteHistory.daily.length < 2) return null;

		const recent = voteHistory.daily.slice(-2);
		if (recent.length < 2) return null;

		const current = recent[1].votes;
		const previous = recent[0].votes;
		const change = current - previous;
		const percentChange = previous > 0 ? (change / previous) * 100 : 0;

		return { change, percentChange, isIncrease: change > 0 };
	};

	// Find peak voting hours
	const getPeakHours = () => {
		if (!voteHistory?.hourly) return null;

		const sorted = [...voteHistory.hourly].sort((a, b) => b.votes - a.votes);
		return sorted.slice(0, 3);
	};

	const velocity = getVoteVelocity();
	const peakHours = getPeakHours();

	return (
		<div className={cn("space-y-4", className)}>
			{/* Main Stats */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4 text-center">
						<div className="flex items-center justify-center mb-2">
							<Heart className="w-5 h-5 text-red-500" />
						</div>
						<div className="text-2xl font-bold">{totalVotes}</div>
						<div className="text-xs text-gray-500">Total Votes</div>
					</CardContent>
				</Card>

				{rank && totalPhotos && (
					<Card>
						<CardContent className="p-4 text-center">
							<div className="flex items-center justify-center mb-2">
								<BarChart3 className="w-5 h-5 text-blue-500" />
							</div>
							<div className="text-2xl font-bold">#{rank}</div>
							<div className="text-xs text-gray-500">of {totalPhotos}</div>
						</CardContent>
					</Card>
				)}

				{averageScore && (
					<Card>
						<CardContent className="p-4 text-center">
							<div className="flex items-center justify-center mb-2">
								<Users className="w-5 h-5 text-green-500" />
							</div>
							<div className="text-2xl font-bold">
								{averageScore.toFixed(1)}
							</div>
							<div className="text-xs text-gray-500">Avg Score</div>
						</CardContent>
					</Card>
				)}

				{velocity && (
					<Card>
						<CardContent className="p-4 text-center">
							<div className="flex items-center justify-center mb-2">
								{velocity.isIncrease ? (
									<TrendingUp className="w-5 h-5 text-green-500" />
								) : (
									<TrendingDown className="w-5 h-5 text-red-500" />
								)}
							</div>
							<div
								className={cn(
									"text-2xl font-bold",
									velocity.isIncrease ? "text-green-600" : "text-red-600",
								)}
							>
								{velocity.isIncrease ? "+" : ""}
								{velocity.change}
							</div>
							<div className="text-xs text-gray-500">24h Change</div>
						</CardContent>
					</Card>
				)}
			</div>

			{/* Detailed Breakdown */}
			{showBreakdown && voteHistory && (
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Vote Activity</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Daily Activity Chart */}
						{voteHistory.daily && voteHistory.daily.length > 0 && (
							<div>
								<h4 className="font-medium mb-2">Daily Votes (Last 7 Days)</h4>
								<div className="flex items-end gap-1 h-24">
									{voteHistory.daily.slice(-7).map((day, index) => {
										const maxVotes = Math.max(
											...voteHistory.daily.slice(-7).map((d) => d.votes),
										);
										const height =
											maxVotes > 0 ? (day.votes / maxVotes) * 100 : 0;

										return (
											<div
												// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
												key={index}
												className="flex-1 flex flex-col items-center"
											>
												<div
													className="w-full bg-blue-500 rounded-t"
													style={{ height: `${height}%` }}
												/>
												<div className="text-xs text-gray-500 mt-1">
													{new Date(day.date).toLocaleDateString("en-US", {
														weekday: "short",
													})}
												</div>
												<div className="text-xs font-medium">{day.votes}</div>
											</div>
										);
									})}
								</div>
							</div>
						)}

						{/* Peak Hours */}
						{peakHours && (
							<div>
								<h4 className="font-medium mb-2 flex items-center gap-2">
									<Clock className="w-4 h-4" />
									Peak Voting Hours
								</h4>
								<div className="space-y-2">
									{peakHours.map((hour, index) => (
										<div
											key={hour.hour}
											className="flex justify-between items-center"
										>
											<span className="text-sm">
												{hour.hour}:00 - {hour.hour + 1}:00
											</span>
											<div className="flex items-center gap-2">
												<div className="w-16 bg-gray-200 rounded-full h-2">
													<div
														className="bg-blue-500 h-2 rounded-full"
														style={{
															width: `${(hour.votes / peakHours[0].votes) * 100}%`,
														}}
													/>
												</div>
												<span className="text-sm font-medium w-8">
													{hour.votes}
												</span>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Velocity Indicator */}
						{velocity && (
							<div>
								<h4 className="font-medium mb-2">Voting Momentum</h4>
								<div className="flex items-center gap-3">
									{velocity.isIncrease ? (
										<TrendingUp className="w-5 h-5 text-green-500" />
									) : (
										<TrendingDown className="w-5 h-5 text-red-500" />
									)}
									<div>
										<div
											className={cn(
												"font-medium",
												velocity.isIncrease ? "text-green-600" : "text-red-600",
											)}
										>
											{velocity.isIncrease ? "+" : ""}
											{velocity.change} votes
										</div>
										<div className="text-sm text-gray-500">
											{velocity.percentChange.toFixed(1)}% vs yesterday
										</div>
									</div>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			)}

			{/* Simple Chart */}
			{showChart && voteHistory?.daily && (
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Vote History</CardTitle>
					</CardHeader>
					<CardContent>
						<SimpleLineChart data={voteHistory.daily} />
					</CardContent>
				</Card>
			)}
		</div>
	);
}

// Simple line chart component
interface SimpleLineChartProps {
	data: Array<{ date: string; votes: number }>;
}

function SimpleLineChart({ data }: SimpleLineChartProps) {
	if (!data || data.length === 0) return null;

	const maxVotes = Math.max(...data.map((d) => d.votes));
	const minVotes = Math.min(...data.map((d) => d.votes));
	const range = maxVotes - minVotes || 1;

	return (
		<div className="h-32 relative">
			<svg className="w-full h-full" viewBox="0 0 300 100">
				<title>Vote History Chart</title>
				{/* Grid lines */}
				{[0, 25, 50, 75, 100].map((y) => (
					<line
						key={y}
						x1="0"
						y1={y}
						x2="300"
						y2={y}
						stroke="#f3f4f6"
						strokeWidth="1"
					/>
				))}

				{/* Data line */}
				<polyline
					points={data
						.map((point, index) => {
							const x = (index / (data.length - 1)) * 300;
							const y = 100 - ((point.votes - minVotes) / range) * 100;
							return `${x},${y}`;
						})
						.join(" ")}
					fill="none"
					stroke="#3b82f6"
					strokeWidth="2"
				/>

				{/* Data points */}
				{data.map((point, index) => {
					const x = (index / (data.length - 1)) * 300;
					const y = 100 - ((point.votes - minVotes) / range) * 100;
					// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					return <circle key={index} cx={x} cy={y} r="3" fill="#3b82f6" />;
				})}
			</svg>

			{/* Labels */}
			<div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
				<span>{new Date(data[0].date).toLocaleDateString()}</span>
				<span>{new Date(data[data.length - 1].date).toLocaleDateString()}</span>
			</div>
		</div>
	);
}

// Compact stats component for smaller spaces
interface CompactVoteStatsProps {
	totalVotes: number;
	rank?: number;
	change?: number;
	className?: string;
}

export function CompactVoteStats({
	totalVotes,
	rank,
	change,
	className,
}: CompactVoteStatsProps) {
	return (
		<div className={cn("flex items-center gap-4 text-sm", className)}>
			<div className="flex items-center gap-1">
				<Heart className="w-4 h-4 text-red-500" />
				<span className="font-medium">{totalVotes}</span>
			</div>

			{rank && (
				<div className="flex items-center gap-1">
					<BarChart3 className="w-4 h-4 text-blue-500" />
					<span>#{rank}</span>
				</div>
			)}

			{change !== undefined && (
				<div
					className={cn(
						"flex items-center gap-1",
						change > 0
							? "text-green-600"
							: change < 0
								? "text-red-600"
								: "text-gray-500",
					)}
				>
					{change > 0 ? (
						<TrendingUp className="w-4 h-4" />
					) : change < 0 ? (
						<TrendingDown className="w-4 h-4" />
					) : null}
					<span>
						{change > 0 ? "+" : ""}
						{change}
					</span>
				</div>
			)}
		</div>
	);
}
