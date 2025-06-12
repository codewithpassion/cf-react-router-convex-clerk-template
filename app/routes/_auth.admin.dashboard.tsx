import { format } from "date-fns";
import {
	AlertTriangle,
	CheckCircle,
	Clock,
	Heart,
	Photo,
	Trophy,
	TrophyIcon,
	Users,
} from "lucide-react";
import { Link } from "react-router";
import { DashboardHeader } from "~/components/features/admin/dashboard-header";
import {
	CompetitionMetricCard,
	MetricCard,
	ModerationMetricCard,
	UserActivityMetricCard,
} from "~/components/features/admin/metric-card";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useAdminStats, useRecentActivity } from "~/hooks/use-admin";

function QuickActions() {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TrophyIcon className="w-5 h-5" />
					Quick Actions
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				<Button asChild className="w-full">
					<Link to="/admin/competitions/new">Create Competition</Link>
				</Button>
				<Button variant="outline" asChild className="w-full">
					<Link to="/admin/moderation">Review Pending Photos</Link>
				</Button>
				<Button variant="outline" asChild className="w-full">
					<Link to="/admin/users">Manage Users</Link>
				</Button>
				<Button variant="outline" asChild className="w-full">
					<Link to="/admin/analytics">View Analytics</Link>
				</Button>
			</CardContent>
		</Card>
	);
}

function RecentActivityPanel({ activities }: { activities?: any[] }) {
	if (!activities) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Clock className="w-5 h-5" />
						Recent Activity
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{[1, 2, 3, 4].map((i) => (
							<div
								key={i}
								className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
							>
								<div className="p-1 bg-gray-200 rounded-full animate-pulse">
									<div className="w-3 h-3" />
								</div>
								<div className="flex-1 space-y-2">
									<div className="h-4 bg-gray-200 rounded animate-pulse" />
									<div className="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Clock className="w-5 h-5" />
					Recent Activity
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{activities.length === 0 ? (
						<p className="text-sm text-gray-500 text-center py-4">
							No recent activity
						</p>
					) : (
						activities.map((activity) => (
							<div
								key={activity.id}
								className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
							>
								<div className="p-1 bg-blue-100 rounded-full">
									{activity.type === "photo_submitted" && (
										<Photo className="w-3 h-3 text-blue-600" />
									)}
									{activity.type === "competition_created" && (
										<Trophy className="w-3 h-3 text-blue-600" />
									)}
									{activity.type === "photo_approved" && (
										<CheckCircle className="w-3 h-3 text-blue-600" />
									)}
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm">
										<span className="font-medium">
											{activity.user?.name || activity.user}
										</span>
										{activity.type === "photo_submitted" &&
											" submitted a photo to "}
										{activity.type === "competition_created" && " created "}
										{activity.type === "photo_approved" &&
											" had their photo approved in "}
										<span className="font-medium">
											{activity.competition?.title || activity.competition}
										</span>
									</p>
									<p className="text-xs text-gray-500">
										{activity.createdAt
											? format(new Date(activity.createdAt), "MMM dd, HH:mm")
											: activity.time}
									</p>
								</div>
							</div>
						))
					)}
				</div>
			</CardContent>
		</Card>
	);
}

function ModerationQueuePreview() {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<AlertTriangle className="w-5 h-5" />
					Moderation Queue
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					<div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
						<div>
							<p className="text-sm font-medium">23 photos pending review</p>
							<p className="text-xs text-gray-600">
								Some photos have been waiting over 24 hours
							</p>
						</div>
						<AlertTriangle className="w-5 h-5 text-yellow-600" />
					</div>

					<div className="grid grid-cols-3 gap-2">
						{/* Mock photo thumbnails */}
						{[1, 2, 3].map((i) => (
							<div
								key={`photo-${i}`}
								className="aspect-square bg-gray-200 rounded-md animate-pulse"
							/>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export default function AdminDashboard() {
	const { data: stats, isLoading: statsLoading } = useAdminStats();
	const { data: recentActivity } = useRecentActivity({ limit: 10 });

	if (statsLoading) {
		return (
			<div className="space-y-6">
				<DashboardHeader />
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{[1, 2, 3, 4].map((i) => (
						<MetricCard
							key={i}
							title="Loading..."
							value={0}
							icon={Trophy}
							loading
						/>
					))}
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2">
						<RecentActivityPanel />
					</div>
					<div className="space-y-6">
						<QuickActions />
						<ModerationQueuePreview />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<DashboardHeader />

			{/* Key Metrics */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<MetricCard
					title="Total Votes Today"
					value={stats?.todayVotes || 0}
					change={stats?.votesChange}
					icon={Heart}
					color="green"
				/>
				<MetricCard
					title="Pending Photos"
					value={stats?.pendingPhotos || 0}
					change={stats?.photosChange}
					icon={Photo}
					color="orange"
					urgent={(stats?.pendingPhotos || 0) > 50}
				/>
			</div>

			{/* Specialized Metric Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<CompetitionMetricCard
					activeCount={stats?.competitions?.active || 0}
					draftCount={stats?.competitions?.draft || 0}
					closedCount={stats?.competitions?.closed || 0}
					change={stats?.competitionsChange}
				/>
				<ModerationMetricCard
					pendingCount={stats?.moderation?.pending || 0}
					averageTime={stats?.moderation?.averageTime || "N/A"}
					todayProcessed={stats?.moderation?.todayProcessed || 0}
					urgent={(stats?.moderation?.pending || 0) > 20}
				/>
				<UserActivityMetricCard
					activeUsers={stats?.users?.active || 0}
					newUsers={stats?.users?.new || 0}
					totalUsers={stats?.users?.total || 0}
					change={stats?.usersChange}
				/>
			</div>

			{/* Activity and Quick Actions */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2">
					<RecentActivityPanel activities={recentActivity} />
				</div>
				<div className="space-y-6">
					<QuickActions />
					<ModerationQueuePreview />
				</div>
			</div>
		</div>
	);
}
