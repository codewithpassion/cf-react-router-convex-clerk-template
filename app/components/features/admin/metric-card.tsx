import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface MetricCardProps {
	title: string;
	value: number | string;
	icon: React.ComponentType<{ className?: string }>;
	change?: {
		value: number;
		isPositive: boolean;
		period?: string;
	};
	urgent?: boolean;
	trend?: "up" | "down" | "neutral";
	color?: "blue" | "green" | "red" | "orange" | "purple";
	onClick?: () => void;
	loading?: boolean;
}

export function MetricCard({
	title,
	value,
	icon: Icon,
	change,
	urgent = false,
	trend = "neutral",
	color = "blue",
	onClick,
	loading = false,
}: MetricCardProps) {
	const colorClasses = {
		blue: {
			bg: "bg-blue-100",
			text: "text-blue-600",
			border: "border-blue-200",
		},
		green: {
			bg: "bg-green-100",
			text: "text-green-600",
			border: "border-green-200",
		},
		red: {
			bg: "bg-red-100",
			text: "text-red-600",
			border: "border-red-200",
		},
		orange: {
			bg: "bg-orange-100",
			text: "text-orange-600",
			border: "border-orange-200",
		},
		purple: {
			bg: "bg-purple-100",
			text: "text-purple-600",
			border: "border-purple-200",
		},
	};

	const cardColor = urgent ? colorClasses.orange : colorClasses[color];

	if (loading) {
		return (
			<Card>
				<CardContent className="p-6">
					<div className="flex items-center justify-between">
						<div className="space-y-2 flex-1">
							<div className="h-4 bg-gray-200 rounded animate-pulse" />
							<div className="h-8 bg-gray-200 rounded animate-pulse w-1/2" />
							<div className="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
						</div>
						<div className={cn("p-3 rounded-full", cardColor.bg)}>
							<div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card
			className={cn(
				"transition-all duration-200",
				urgent && `border-2 ${cardColor.border} bg-orange-50`,
				onClick && "cursor-pointer hover:shadow-md",
			)}
			onClick={onClick}
		>
			<CardContent className="p-6">
				<div className="flex items-center justify-between">
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<p className="text-sm font-medium text-gray-600">{title}</p>
							{urgent && <AlertTriangle className="w-4 h-4 text-orange-500" />}
						</div>

						<div className="space-y-1">
							<p className="text-2xl font-bold">{value}</p>

							{change && (
								<div className="flex items-center gap-1">
									<div
										className={cn(
											"flex items-center gap-1 text-sm",
											change.isPositive ? "text-green-600" : "text-red-600",
										)}
									>
										{change.isPositive ? (
											<TrendingUp className="w-3 h-3" />
										) : (
											<TrendingDown className="w-3 h-3" />
										)}
										<span>
											{change.isPositive ? "+" : ""}
											{change.value}%
										</span>
									</div>
									{change.period && (
										<span className="text-xs text-gray-500">
											{change.period}
										</span>
									)}
								</div>
							)}
						</div>
					</div>

					<div className={cn("p-3 rounded-full", cardColor.bg)}>
						<Icon className={cn("w-6 h-6", cardColor.text)} />
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// Specialized metric cards for common admin metrics
export function CompetitionMetricCard({
	activeCount,
	draftCount,
	closedCount,
	change,
	onClick,
}: {
	activeCount: number;
	draftCount: number;
	closedCount: number;
	change?: { value: number; isPositive: boolean };
	onClick?: () => void;
}) {
	return (
		<Card
			className={cn(
				"transition-all duration-200",
				onClick && "cursor-pointer hover:shadow-md",
			)}
			onClick={onClick}
		>
			<CardContent className="p-6">
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h3 className="font-medium text-gray-900">Competitions</h3>
						{change && (
							<div
								className={cn(
									"flex items-center gap-1 text-sm",
									change.isPositive ? "text-green-600" : "text-red-600",
								)}
							>
								{change.isPositive ? (
									<TrendingUp className="w-3 h-3" />
								) : (
									<TrendingDown className="w-3 h-3" />
								)}
								<span>
									{change.isPositive ? "+" : ""}
									{change.value}%
								</span>
							</div>
						)}
					</div>

					<div className="grid grid-cols-3 gap-4">
						<div className="text-center">
							<div className="text-lg font-bold text-green-600">
								{activeCount}
							</div>
							<div className="text-xs text-gray-500">Active</div>
						</div>
						<div className="text-center">
							<div className="text-lg font-bold text-yellow-600">
								{draftCount}
							</div>
							<div className="text-xs text-gray-500">Draft</div>
						</div>
						<div className="text-center">
							<div className="text-lg font-bold text-gray-600">
								{closedCount}
							</div>
							<div className="text-xs text-gray-500">Closed</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export function ModerationMetricCard({
	pendingCount,
	averageTime,
	todayProcessed,
	urgent = false,
	onClick,
}: {
	pendingCount: number;
	averageTime: string;
	todayProcessed: number;
	urgent?: boolean;
	onClick?: () => void;
}) {
	return (
		<Card
			className={cn(
				"transition-all duration-200",
				urgent && "border-2 border-orange-200 bg-orange-50",
				onClick && "cursor-pointer hover:shadow-md",
			)}
			onClick={onClick}
		>
			<CardContent className="p-6">
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h3 className="font-medium text-gray-900">Moderation Queue</h3>
						{urgent && <AlertTriangle className="w-4 h-4 text-orange-500" />}
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<div className="text-2xl font-bold text-orange-600">
								{pendingCount}
							</div>
							<div className="text-xs text-gray-500">Pending</div>
						</div>
						<div>
							<div className="text-lg font-bold text-blue-600">
								{todayProcessed}
							</div>
							<div className="text-xs text-gray-500">Processed Today</div>
						</div>
					</div>

					<div className="text-center">
						<div className="text-sm text-gray-600">
							Avg. processing time:{" "}
							<span className="font-medium">{averageTime}</span>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export function UserActivityMetricCard({
	activeUsers,
	newUsers,
	totalUsers,
	change,
	onClick,
}: {
	activeUsers: number;
	newUsers: number;
	totalUsers: number;
	change?: { value: number; isPositive: boolean };
	onClick?: () => void;
}) {
	return (
		<Card
			className={cn(
				"transition-all duration-200",
				onClick && "cursor-pointer hover:shadow-md",
			)}
			onClick={onClick}
		>
			<CardContent className="p-6">
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h3 className="font-medium text-gray-900">User Activity</h3>
						{change && (
							<div
								className={cn(
									"flex items-center gap-1 text-sm",
									change.isPositive ? "text-green-600" : "text-red-600",
								)}
							>
								{change.isPositive ? (
									<TrendingUp className="w-3 h-3" />
								) : (
									<TrendingDown className="w-3 h-3" />
								)}
								<span>
									{change.isPositive ? "+" : ""}
									{change.value}%
								</span>
							</div>
						)}
					</div>

					<div className="space-y-3">
						<div className="flex justify-between">
							<span className="text-sm text-gray-600">Active (24h)</span>
							<span className="font-medium">{activeUsers}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-sm text-gray-600">New (7d)</span>
							<span className="font-medium text-green-600">+{newUsers}</span>
						</div>
						<div className="flex justify-between border-t pt-2">
							<span className="text-sm text-gray-600">Total Users</span>
							<span className="font-bold">{totalUsers}</span>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
