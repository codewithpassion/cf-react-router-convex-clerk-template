import { format } from "date-fns";
import {
	AlertCircle,
	AlertTriangle,
	Bell,
	CheckCircle,
	Plus,
	Settings,
	Shield,
} from "lucide-react";
import { Link } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import { useAdminNotifications, useSystemHealth } from "~/hooks/use-admin";
import { useAuth } from "~/hooks/use-auth";
import { cn } from "~/lib/utils";

export function DashboardHeader() {
	const { user } = useAuth();
	const { data: health } = useSystemHealth();
	const { notifications, unreadCount, markAsRead, markAllAsRead } =
		useAdminNotifications();

	return (
		<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
			<div>
				<h1 className="text-2xl font-semibold text-gray-900">
					Welcome back, {user?.name}
				</h1>
				<p className="text-gray-600">
					{format(new Date(), "EEEE, MMMM do, yyyy")}
				</p>
			</div>

			<div className="flex items-center gap-4">
				{/* System Health Indicator */}
				<SystemHealthIndicator health={health} />

				{/* Notifications */}
				<Popover>
					<PopoverTrigger asChild>
						<Button variant="outline" size="sm" className="relative">
							<Bell className="w-4 h-4" />
							{unreadCount > 0 && (
								<Badge
									variant="destructive"
									className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0"
								>
									{unreadCount > 99 ? "99+" : unreadCount}
								</Badge>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-80" align="end">
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h4 className="font-medium">Notifications</h4>
								{unreadCount > 0 && (
									<Button
										variant="ghost"
										size="sm"
										onClick={markAllAsRead}
										className="text-xs"
									>
										Mark all read
									</Button>
								)}
							</div>

							<div className="space-y-2 max-h-64 overflow-y-auto">
								{notifications.length === 0 ? (
									<p className="text-sm text-gray-500 text-center py-4">
										No notifications
									</p>
								) : (
									notifications.slice(0, 10).map((notification) => (
										<div
											key={notification.id}
											className={cn(
												"p-3 rounded border text-sm transition-colors cursor-pointer",
												notification.read
													? "bg-gray-50 text-gray-600"
													: "bg-blue-50 text-blue-900 border-blue-200",
											)}
											onClick={() => markAsRead(notification.id)}
										>
											<div className="flex items-start gap-2">
												<NotificationIcon type={notification.type} />
												<div className="flex-1 min-w-0">
													<p className="font-medium truncate">
														{notification.title}
													</p>
													<p className="text-xs text-gray-500 mt-1">
														{notification.message}
													</p>
													<p className="text-xs text-gray-400 mt-1">
														{format(notification.timestamp, "MMM dd, HH:mm")}
													</p>
												</div>
											</div>
										</div>
									))
								)}
							</div>

							{notifications.length > 10 && (
								<div className="text-center">
									<Button variant="ghost" size="sm" asChild>
										<Link to="/admin/notifications">
											View all notifications
										</Link>
									</Button>
								</div>
							)}
						</div>
					</PopoverContent>
				</Popover>

				{/* Quick Actions */}
				<div className="flex items-center gap-2">
					<Button size="sm" variant="outline" asChild>
						<Link to="/admin/settings">
							<Settings className="w-4 h-4 mr-2" />
							Settings
						</Link>
					</Button>

					<Button size="sm" asChild>
						<Link to="/admin/competitions/new">
							<Plus className="w-4 h-4 mr-2" />
							New Competition
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}

// System health indicator component
interface SystemHealthIndicatorProps {
	health?: {
		status: "healthy" | "warning" | "critical";
		uptime: number;
		memory: number;
		cpu: number;
		database: "connected" | "slow" | "disconnected";
		issues: Array<{
			type: string;
			message: string;
			severity: "low" | "medium" | "high";
		}>;
	};
}

function SystemHealthIndicator({ health }: SystemHealthIndicatorProps) {
	if (!health) {
		return (
			<div className="flex items-center gap-2 text-gray-500">
				<div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
				<span className="text-sm">Checking...</span>
			</div>
		);
	}

	const getStatusColor = () => {
		switch (health.status) {
			case "healthy":
				return "text-green-600";
			case "warning":
				return "text-yellow-600";
			case "critical":
				return "text-red-600";
			default:
				return "text-gray-600";
		}
	};

	const getStatusIcon = () => {
		switch (health.status) {
			case "healthy":
				return <CheckCircle className="w-4 h-4" />;
			case "warning":
				return <AlertTriangle className="w-4 h-4" />;
			case "critical":
				return <AlertCircle className="w-4 h-4" />;
			default:
				return <Shield className="w-4 h-4" />;
		}
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className={cn("gap-2", getStatusColor())}
				>
					{getStatusIcon()}
					<span className="text-sm capitalize">{health.status}</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-64" align="end">
				<div className="space-y-3">
					<div>
						<h4 className="font-medium">System Health</h4>
						<p className="text-sm text-gray-600">Current system status</p>
					</div>

					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span>Uptime</span>
							<span>{Math.floor(health.uptime / 3600)}h</span>
						</div>
						<div className="flex justify-between text-sm">
							<span>Memory Usage</span>
							<span>{health.memory}%</span>
						</div>
						<div className="flex justify-between text-sm">
							<span>CPU Usage</span>
							<span>{health.cpu}%</span>
						</div>
						<div className="flex justify-between text-sm">
							<span>Database</span>
							<span
								className={cn(
									"capitalize",
									health.database === "connected"
										? "text-green-600"
										: health.database === "slow"
											? "text-yellow-600"
											: "text-red-600",
								)}
							>
								{health.database}
							</span>
						</div>
					</div>

					{health.issues.length > 0 && (
						<div>
							<h5 className="font-medium text-sm">Issues</h5>
							<div className="space-y-1">
								{health.issues.map((issue, index) => (
									<div
										key={index}
										className={cn(
											"text-xs p-2 rounded border",
											issue.severity === "high"
												? "bg-red-50 border-red-200 text-red-700"
												: issue.severity === "medium"
													? "bg-yellow-50 border-yellow-200 text-yellow-700"
													: "bg-blue-50 border-blue-200 text-blue-700",
										)}
									>
										<div className="font-medium">{issue.type}</div>
										<div>{issue.message}</div>
									</div>
								))}
							</div>
						</div>
					)}

					<div className="text-center">
						<Button variant="ghost" size="sm" asChild>
							<Link to="/admin/system">View System Details</Link>
						</Button>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}

// Notification icon component
function NotificationIcon({ type }: { type: string }) {
	switch (type) {
		case "moderation":
			return <Shield className="w-4 h-4 text-orange-500" />;
		case "competition":
			return <Plus className="w-4 h-4 text-blue-500" />;
		case "user":
			return <Bell className="w-4 h-4 text-green-500" />;
		case "system":
			return <AlertCircle className="w-4 h-4 text-red-500" />;
		default:
			return <Bell className="w-4 h-4 text-gray-500" />;
	}
}
