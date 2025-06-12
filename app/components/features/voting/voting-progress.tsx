import { CheckCircle, Progress as ProgressIcon, Target } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { cn } from "~/lib/utils";

interface Category {
	id: string;
	name: string;
	description?: string;
	_count?: {
		photos: number;
	};
}

interface VotingProgressProps {
	competitionId: string;
	totalPhotos: number;
	votedPhotos: number;
	categories: Category[];
	categoryProgress?: Record<string, { voted: number; total: number }>;
	className?: string;
}

export function VotingProgress({
	competitionId,
	totalPhotos,
	votedPhotos,
	categories,
	categoryProgress,
	className,
}: VotingProgressProps) {
	const progressPercentage =
		totalPhotos > 0 ? (votedPhotos / totalPhotos) * 100 : 0;
	const isComplete = progressPercentage >= 100;

	return (
		<Card className={cn("p-6", className)}>
			<div className="space-y-4">
				{/* Header */}
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-semibold flex items-center gap-2">
						<ProgressIcon className="w-5 h-5" />
						Voting Progress
					</h3>
					<Badge variant={isComplete ? "default" : "secondary"}>
						{votedPhotos}/{totalPhotos} voted
					</Badge>
				</div>

				{/* Overall Progress */}
				<div className="space-y-2">
					<div className="flex justify-between text-sm">
						<span>Overall Progress</span>
						<span className="font-medium">
							{Math.round(progressPercentage)}%
						</span>
					</div>
					<Progress value={progressPercentage} className="h-3" />
					<div className="text-xs text-gray-500">
						{totalPhotos - votedPhotos} photos remaining
					</div>
				</div>

				{/* Category Breakdown */}
				{categoryProgress && categories.length > 0 && (
					<div className="space-y-3">
						<h4 className="font-medium text-sm text-gray-700">By Category</h4>
						<div className="space-y-2">
							{categories.map((category) => (
								<CategoryProgress
									key={category.id}
									category={category}
									competitionId={competitionId}
									progress={categoryProgress[category.id]}
								/>
							))}
						</div>
					</div>
				)}

				{/* Completion Status */}
				{isComplete && (
					<Alert className="border-green-200 bg-green-50">
						<CheckCircle className="h-4 w-4 text-green-600" />
						<AlertDescription className="text-green-800">
							Excellent! You've voted on all photos in this competition. Your
							participation helps determine the winners!
						</AlertDescription>
					</Alert>
				)}

				{/* Progress Milestones */}
				<ProgressMilestones
					currentPercentage={progressPercentage}
					votedPhotos={votedPhotos}
					totalPhotos={totalPhotos}
				/>
			</div>
		</Card>
	);
}

// Individual category progress component
interface CategoryProgressProps {
	category: Category;
	competitionId: string;
	progress?: { voted: number; total: number };
}

function CategoryProgress({ category, progress }: CategoryProgressProps) {
	if (!progress) return null;

	const categoryPercentage =
		progress.total > 0 ? (progress.voted / progress.total) * 100 : 0;
	const isComplete = categoryPercentage >= 100;

	return (
		<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
			<div className="flex-1 min-w-0">
				<div className="flex items-center justify-between mb-1">
					<span className="text-sm font-medium truncate">{category.name}</span>
					<span className="text-xs text-gray-500 flex-shrink-0 ml-2">
						{progress.voted}/{progress.total}
					</span>
				</div>
				<div className="flex items-center gap-2">
					<Progress value={categoryPercentage} className="h-2 flex-1" />
					{isComplete && (
						<CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
					)}
				</div>
			</div>
		</div>
	);
}

// Progress milestones component
interface ProgressMilestonesProps {
	currentPercentage: number;
	votedPhotos: number;
	totalPhotos: number;
}

function ProgressMilestones({
	currentPercentage,
	votedPhotos,
	totalPhotos,
}: ProgressMilestonesProps) {
	const milestones = [
		{ percentage: 25, label: "Getting Started", icon: "🚀" },
		{ percentage: 50, label: "Halfway There", icon: "⭐" },
		{ percentage: 75, label: "Almost Done", icon: "🎯" },
		{ percentage: 100, label: "Completed", icon: "🏆" },
	];

	const nextMilestone = milestones.find(
		(m) => m.percentage > currentPercentage,
	);
	const lastAchieved = milestones
		.filter((m) => m.percentage <= currentPercentage)
		.pop();

	return (
		<div className="space-y-3">
			<h4 className="font-medium text-sm text-gray-700">Milestones</h4>

			{/* Milestone Progress */}
			<div className="flex justify-between items-center">
				{milestones.map((milestone) => {
					const isAchieved = currentPercentage >= milestone.percentage;
					const isCurrent = nextMilestone?.percentage === milestone.percentage;

					return (
						<div
							key={milestone.percentage}
							className="flex flex-col items-center"
						>
							<div
								className={cn(
									"w-8 h-8 rounded-full flex items-center justify-center text-xs mb-1 transition-colors",
									isAchieved
										? "bg-green-500 text-white"
										: isCurrent
											? "bg-blue-500 text-white animate-pulse"
											: "bg-gray-200 text-gray-500",
								)}
							>
								{isAchieved ? "✓" : milestone.percentage}
							</div>
							<div className="text-xs text-center">
								<div className="font-medium">{milestone.percentage}%</div>
								<div className="text-gray-500 max-w-16 leading-tight">
									{milestone.label}
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Current Status */}
			{lastAchieved && (
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
					<div className="flex items-center gap-2">
						<span className="text-lg">{lastAchieved.icon}</span>
						<div>
							<div className="font-medium text-blue-900">
								{lastAchieved.label}
							</div>
							<div className="text-sm text-blue-700">
								{lastAchieved.percentage === 100
									? "You've completed your voting journey!"
									: `You've voted on ${votedPhotos} photos so far`}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Next Goal */}
			{nextMilestone && currentPercentage < 100 && (
				<div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
					<div className="flex items-center gap-2">
						<Target className="w-4 h-4 text-gray-500" />
						<div>
							<div className="font-medium text-gray-900">Next Goal</div>
							<div className="text-sm text-gray-600">
								Vote on{" "}
								{Math.ceil((nextMilestone.percentage / 100) * totalPhotos) -
									votedPhotos}{" "}
								more photos to reach {nextMilestone.percentage}%
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

// Compact progress component for smaller spaces
interface CompactVotingProgressProps {
	votedPhotos: number;
	totalPhotos: number;
	showPercentage?: boolean;
	className?: string;
}

export function CompactVotingProgress({
	votedPhotos,
	totalPhotos,
	showPercentage = true,
	className,
}: CompactVotingProgressProps) {
	const progressPercentage =
		totalPhotos > 0 ? (votedPhotos / totalPhotos) * 100 : 0;

	return (
		<div className={cn("space-y-2", className)}>
			<div className="flex justify-between items-center text-sm">
				<span className="font-medium">Voting Progress</span>
				<span className="text-gray-600">
					{votedPhotos}/{totalPhotos}
					{showPercentage && ` (${Math.round(progressPercentage)}%)`}
				</span>
			</div>
			<Progress value={progressPercentage} className="h-2" />
		</div>
	);
}

// Progress ring component for circular progress display
interface ProgressRingProps {
	progress: number; // 0-100
	size?: number;
	strokeWidth?: number;
	className?: string;
	children?: React.ReactNode;
}

export function ProgressRing({
	progress,
	size = 120,
	strokeWidth = 8,
	className,
	children,
}: ProgressRingProps) {
	const radius = (size - strokeWidth) / 2;
	const circumference = radius * 2 * Math.PI;
	const offset = circumference - (progress / 100) * circumference;

	return (
		<div
			className={cn(
				"relative inline-flex items-center justify-center",
				className,
			)}
		>
			<svg width={size} height={size} className="transform -rotate-90">
				<title>Progress Ring</title>
				{/* Background circle */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke="currentColor"
					strokeWidth={strokeWidth}
					fill="transparent"
					className="text-gray-200"
				/>
				{/* Progress circle */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke="currentColor"
					strokeWidth={strokeWidth}
					fill="transparent"
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					strokeLinecap="round"
					className="text-blue-500 transition-all duration-500 ease-in-out"
				/>
			</svg>
			{/* Center content */}
			<div className="absolute inset-0 flex items-center justify-center">
				{children || (
					<div className="text-center">
						<div className="text-2xl font-bold">{Math.round(progress)}%</div>
						<div className="text-xs text-gray-500">Complete</div>
					</div>
				)}
			</div>
		</div>
	);
}
