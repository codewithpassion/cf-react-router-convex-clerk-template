import { format } from "date-fns";
import {
	Activity,
	AlertTriangle,
	Ban,
	Calendar,
	Camera,
	CheckCircle,
	Crown,
	Edit,
	Eye,
	Filter,
	Mail,
	MoreHorizontal,
	Search,
	Shield,
	Trophy,
	UserCheck,
	UserX,
	Users,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import {
	useAllUsers,
	useBanUser,
	useBulkActions,
	useBulkUpdateUsers,
	useUpdateUserRole,
	useUserStats,
} from "~/hooks/use-admin";

interface UserStatsProps {
	stats?: {
		total: number;
		active: number;
		newThisWeek: number;
		banned: number;
		admins: number;
		moderators: number;
	};
}

function UserStats({ stats }: UserStatsProps) {
	if (!stats) {
		return (
			<div className="grid grid-cols-2 md:grid-cols-6 gap-4">
				{[1, 2, 3, 4, 5, 6].map((i) => (
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
		<div className="grid grid-cols-2 md:grid-cols-6 gap-4">
			<Card>
				<CardContent className="p-4">
					<div className="flex items-center gap-2 mb-1">
						<Users className="w-4 h-4 text-blue-600" />
						<span className="text-sm font-medium text-gray-700">Total</span>
					</div>
					<div className="text-2xl font-bold">{stats.total}</div>
				</CardContent>
			</Card>

			<Card className="border-green-200 bg-green-50">
				<CardContent className="p-4">
					<div className="flex items-center gap-2 mb-1">
						<Activity className="w-4 h-4 text-green-600" />
						<span className="text-sm font-medium text-green-700">Active</span>
					</div>
					<div className="text-2xl font-bold text-green-900">
						{stats.active}
					</div>
				</CardContent>
			</Card>

			<Card className="border-blue-200 bg-blue-50">
				<CardContent className="p-4">
					<div className="flex items-center gap-2 mb-1">
						<Calendar className="w-4 h-4 text-blue-600" />
						<span className="text-sm font-medium text-blue-700">New</span>
					</div>
					<div className="text-2xl font-bold text-blue-900">
						{stats.newThisWeek}
					</div>
				</CardContent>
			</Card>

			<Card className="border-red-200 bg-red-50">
				<CardContent className="p-4">
					<div className="flex items-center gap-2 mb-1">
						<Ban className="w-4 h-4 text-red-600" />
						<span className="text-sm font-medium text-red-700">Banned</span>
					</div>
					<div className="text-2xl font-bold text-red-900">{stats.banned}</div>
				</CardContent>
			</Card>

			<Card className="border-purple-200 bg-purple-50">
				<CardContent className="p-4">
					<div className="flex items-center gap-2 mb-1">
						<Crown className="w-4 h-4 text-purple-600" />
						<span className="text-sm font-medium text-purple-700">Admins</span>
					</div>
					<div className="text-2xl font-bold text-purple-900">
						{stats.admins}
					</div>
				</CardContent>
			</Card>

			<Card className="border-orange-200 bg-orange-50">
				<CardContent className="p-4">
					<div className="flex items-center gap-2 mb-1">
						<Shield className="w-4 h-4 text-orange-600" />
						<span className="text-sm font-medium text-orange-700">
							Moderators
						</span>
					</div>
					<div className="text-2xl font-bold text-orange-900">
						{stats.moderators}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

interface UserFiltersProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	filterRole: string;
	onRoleChange: (value: string) => void;
	filterStatus: string;
	onStatusChange: (value: string) => void;
}

function UserFilters({
	searchQuery,
	onSearchChange,
	filterRole,
	onRoleChange,
	filterStatus,
	onStatusChange,
}: UserFiltersProps) {
	return (
		<Card>
			<CardContent className="p-6">
				<div className="flex flex-col sm:flex-row gap-4">
					<div className="flex-1">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
							<Input
								placeholder="Search users by name, email, or ID..."
								value={searchQuery}
								onChange={(e) => onSearchChange(e.target.value)}
								className="pl-10"
							/>
						</div>
					</div>
					<div className="flex gap-2">
						<Select value={filterRole} onValueChange={onRoleChange}>
							<SelectTrigger className="w-40">
								<Filter className="w-4 h-4 mr-2" />
								<SelectValue placeholder="Role" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Roles</SelectItem>
								<SelectItem value="user">Users</SelectItem>
								<SelectItem value="moderator">Moderators</SelectItem>
								<SelectItem value="admin">Admins</SelectItem>
								<SelectItem value="super_admin">Super Admins</SelectItem>
							</SelectContent>
						</Select>

						<Select value={filterStatus} onValueChange={onStatusChange}>
							<SelectTrigger className="w-40">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="banned">Banned</SelectItem>
								<SelectItem value="pending">Pending</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

interface UserTableProps {
	users?: any[];
	selectedUsers: string[];
	onSelectionChange: (selected: string[]) => void;
	onRoleChange: (userId: string, role: string) => void;
	onBanUser: (userId: string, reason: string) => void;
	onViewProfile: (userId: string) => void;
	isLoading: boolean;
}

function UserTable({
	users = [],
	selectedUsers,
	onSelectionChange,
	onRoleChange,
	onBanUser,
	onViewProfile,
	isLoading,
}: UserTableProps) {
	const [banDialogOpen, setBanDialogOpen] = useState(false);
	const [banReason, setBanReason] = useState("");
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
	const { toggleItem, toggleAll, isSelected } = useBulkActions();

	const handleBanUser = (userId: string) => {
		setSelectedUserId(userId);
		setBanDialogOpen(true);
	};

	const confirmBan = () => {
		if (selectedUserId) {
			onBanUser(selectedUserId, banReason);
			setBanDialogOpen(false);
			setBanReason("");
			setSelectedUserId(null);
		}
	};

	const getRoleBadge = (role: string) => {
		switch (role) {
			case "super_admin":
				return (
					<Badge className="bg-purple-100 text-purple-800">Super Admin</Badge>
				);
			case "admin":
				return <Badge className="bg-blue-100 text-blue-800">Admin</Badge>;
			case "moderator":
				return (
					<Badge className="bg-orange-100 text-orange-800">Moderator</Badge>
				);
			default:
				return <Badge variant="outline">User</Badge>;
		}
	};

	const getStatusBadge = (status: string, isBanned?: boolean) => {
		if (isBanned) {
			return <Badge variant="destructive">Banned</Badge>;
		}
		switch (status) {
			case "active":
				return <Badge className="bg-green-100 text-green-800">Active</Badge>;
			case "pending":
				return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
			default:
				return <Badge variant="outline">Unknown</Badge>;
		}
	};

	if (isLoading) {
		return (
			<Card>
				<CardContent className="p-6">
					<div className="space-y-4">
						{[1, 2, 3, 4, 5].map((i) => (
							<div key={i} className="flex items-center space-x-4">
								<div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
								<div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
								<div className="flex-1 space-y-2">
									<div className="h-4 bg-gray-200 rounded animate-pulse" />
									<div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
								</div>
								<div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
								<div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<Card>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-12">
								<Checkbox
									checked={
										selectedUsers.length === users.length && users.length > 0
									}
									onCheckedChange={() => toggleAll(users)}
								/>
							</TableHead>
							<TableHead>User</TableHead>
							<TableHead>Role</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Activity</TableHead>
							<TableHead>Joined</TableHead>
							<TableHead className="w-12"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{users.length === 0 ? (
							<TableRow>
								<TableCell colSpan={7} className="text-center py-8">
									<div className="flex flex-col items-center gap-2">
										<Users className="w-12 h-12 text-gray-400" />
										<p className="text-gray-500">No users found</p>
									</div>
								</TableCell>
							</TableRow>
						) : (
							users.map((user) => (
								<TableRow key={user.id}>
									<TableCell>
										<Checkbox
											checked={isSelected(user.id)}
											onCheckedChange={() => toggleItem(user.id)}
										/>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-3">
											<Avatar className="w-8 h-8">
												<AvatarImage src={user.image} alt={user.name} />
												<AvatarFallback>
													{user.name?.charAt(0)?.toUpperCase() || "U"}
												</AvatarFallback>
											</Avatar>
											<div>
												<div className="font-medium">{user.name}</div>
												<div className="text-sm text-gray-500">
													{user.email}
												</div>
											</div>
										</div>
									</TableCell>
									<TableCell>{getRoleBadge(user.role)}</TableCell>
									<TableCell>
										{getStatusBadge(user.status, user.banned)}
									</TableCell>
									<TableCell>
										<div className="space-y-1 text-sm">
											<div className="flex items-center gap-1">
												<Camera className="w-3 h-3 text-gray-400" />
												<span>{user._count?.photos || 0} photos</span>
											</div>
											<div className="flex items-center gap-1">
												<Trophy className="w-3 h-3 text-gray-400" />
												<span>{user._count?.votes || 0} votes</span>
											</div>
										</div>
									</TableCell>
									<TableCell>
										<div className="text-sm text-gray-500">
											{user.createdAt
												? format(new Date(user.createdAt), "MMM dd, yyyy")
												: "Unknown"}
										</div>
									</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="sm">
													<MoreHorizontal className="w-4 h-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													onClick={() => onViewProfile(user.id)}
												>
													<Eye className="w-4 h-4 mr-2" />
													View Profile
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => onViewProfile(user.id)}
												>
													<Edit className="w-4 h-4 mr-2" />
													Edit User
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem>
													<Shield className="w-4 h-4 mr-2" />
													Change Role
												</DropdownMenuItem>
												{!user.banned ? (
													<DropdownMenuItem
														onClick={() => handleBanUser(user.id)}
														className="text-red-600"
													>
														<UserX className="w-4 h-4 mr-2" />
														Ban User
													</DropdownMenuItem>
												) : (
													<DropdownMenuItem
														onClick={() => onBanUser(user.id, "")}
														className="text-green-600"
													>
														<UserCheck className="w-4 h-4 mr-2" />
														Unban User
													</DropdownMenuItem>
												)}
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</Card>

			{/* Ban User Dialog */}
			<Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Ban User</DialogTitle>
						<DialogDescription>
							Please provide a reason for banning this user. This action can be
							reversed later.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<Label htmlFor="banReason">Reason for Ban</Label>
							<Textarea
								id="banReason"
								value={banReason}
								onChange={(e) => setBanReason(e.target.value)}
								placeholder="Explain why this user is being banned..."
								rows={3}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setBanDialogOpen(false)}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={confirmBan}>
							Ban User
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

interface BulkUserActionsProps {
	selectedCount: number;
	onBulkRoleChange: (role: string) => void;
	onBulkBan: () => void;
	onClearSelection: () => void;
}

function BulkUserActions({
	selectedCount,
	onBulkRoleChange,
	onBulkBan,
	onClearSelection,
}: BulkUserActionsProps) {
	return (
		<Card className="border-blue-200 bg-blue-50">
			<CardContent className="p-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<span className="text-sm font-medium">
							{selectedCount} user{selectedCount !== 1 ? "s" : ""} selected
						</span>
						<div className="flex gap-2">
							<Select onValueChange={onBulkRoleChange}>
								<SelectTrigger className="w-40">
									<SelectValue placeholder="Change Role" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="user">Set to User</SelectItem>
									<SelectItem value="moderator">Set to Moderator</SelectItem>
									<SelectItem value="admin">Set to Admin</SelectItem>
								</SelectContent>
							</Select>
							<Button variant="destructive" size="sm" onClick={onBulkBan}>
								<UserX className="w-4 h-4 mr-2" />
								Ban Selected
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

interface UserActivityProps {
	userId: string;
}

function UserActivity({ userId }: UserActivityProps) {
	// This would fetch user activity data
	const activities = [
		{
			id: 1,
			action: "Submitted photo",
			target: "Nature Contest",
			time: "2 hours ago",
		},
		{
			id: 2,
			action: "Voted on photo",
			target: "Street Photography",
			time: "4 hours ago",
		},
		{
			id: 3,
			action: "Joined competition",
			target: "Portrait Masters",
			time: "1 day ago",
		},
	];

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Activity className="w-5 h-5" />
					Recent Activity
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{activities.map((activity) => (
						<div
							key={activity.id}
							className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
						>
							<div className="p-1 bg-blue-100 rounded-full">
								<Activity className="w-3 h-3 text-blue-600" />
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm">
									<span className="font-medium">{activity.action}</span>
									{" in "}
									<span className="font-medium">{activity.target}</span>
								</p>
								<p className="text-xs text-gray-500">{activity.time}</p>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

export default function UserManagement() {
	const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
	const [filterRole, setFilterRole] = useState<string>("all");
	const [filterStatus, setFilterStatus] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [activeTab, setActiveTab] = useState("users");

	const { data: users, isLoading } = useAllUsers({
		role: filterRole === "all" ? undefined : filterRole,
		status: filterStatus === "all" ? undefined : filterStatus,
		search: searchQuery,
	});

	const { data: stats } = useUserStats();
	const updateRoleMutation = useUpdateUserRole();
	const banUserMutation = useBanUser();
	const bulkUpdateMutation = useBulkUpdateUsers();

	const handleRoleChange = async (userId: string, role: string) => {
		await updateRoleMutation.mutateAsync({ userId, role });
	};

	const handleBanUser = async (userId: string, reason: string) => {
		await banUserMutation.mutateAsync({ userId, reason });
	};

	const handleViewProfile = (userId: string) => {
		// Navigate to user profile or open modal
		console.log("View user profile:", userId);
	};

	const handleBulkRoleChange = async (role: string) => {
		await bulkUpdateMutation.mutateAsync({
			userIds: selectedUsers,
			updates: { role },
		});
		setSelectedUsers([]);
	};

	const handleBulkBan = async () => {
		if (
			confirm(`Are you sure you want to ban ${selectedUsers.length} users?`)
		) {
			await bulkUpdateMutation.mutateAsync({
				userIds: selectedUsers,
				action: "ban",
			});
			setSelectedUsers([]);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-semibold flex items-center gap-2">
						<Users className="w-6 h-6" />
						User Management
					</h1>
					<p className="text-gray-600">Manage user accounts and permissions</p>
				</div>
			</div>

			<UserStats stats={stats} />

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList>
					<TabsTrigger value="users">All Users</TabsTrigger>
					<TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
					<TabsTrigger value="activity">Activity Log</TabsTrigger>
				</TabsList>

				<TabsContent value="users" className="space-y-6">
					<UserFilters
						searchQuery={searchQuery}
						onSearchChange={setSearchQuery}
						filterRole={filterRole}
						onRoleChange={setFilterRole}
						filterStatus={filterStatus}
						onStatusChange={setFilterStatus}
					/>

					<UserTable
						users={users}
						selectedUsers={selectedUsers}
						onSelectionChange={setSelectedUsers}
						onRoleChange={handleRoleChange}
						onBanUser={handleBanUser}
						onViewProfile={handleViewProfile}
						isLoading={isLoading}
					/>

					{selectedUsers.length > 0 && (
						<BulkUserActions
							selectedCount={selectedUsers.length}
							onBulkRoleChange={handleBulkRoleChange}
							onBulkBan={handleBulkBan}
							onClearSelection={() => setSelectedUsers([])}
						/>
					)}
				</TabsContent>

				<TabsContent value="roles" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Role Definitions</CardTitle>
							<CardDescription>
								Understand the different user roles and their permissions
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
								<Card>
									<CardContent className="p-4">
										<div className="flex items-center gap-2 mb-2">
											<Users className="w-4 h-4 text-gray-600" />
											<span className="font-medium">User</span>
										</div>
										<ul className="text-sm text-gray-600 space-y-1">
											<li>• Submit photos</li>
											<li>• Vote on photos</li>
											<li>• View competitions</li>
											<li>• Basic profile access</li>
										</ul>
									</CardContent>
								</Card>

								<Card>
									<CardContent className="p-4">
										<div className="flex items-center gap-2 mb-2">
											<Shield className="w-4 h-4 text-orange-600" />
											<span className="font-medium">Moderator</span>
										</div>
										<ul className="text-sm text-gray-600 space-y-1">
											<li>• All user permissions</li>
											<li>• Moderate content</li>
											<li>• View reports</li>
											<li>• Basic analytics</li>
										</ul>
									</CardContent>
								</Card>

								<Card>
									<CardContent className="p-4">
										<div className="flex items-center gap-2 mb-2">
											<Crown className="w-4 h-4 text-blue-600" />
											<span className="font-medium">Admin</span>
										</div>
										<ul className="text-sm text-gray-600 space-y-1">
											<li>• All moderator permissions</li>
											<li>• Manage competitions</li>
											<li>• User management</li>
											<li>• Full analytics</li>
										</ul>
									</CardContent>
								</Card>

								<Card>
									<CardContent className="p-4">
										<div className="flex items-center gap-2 mb-2">
											<AlertTriangle className="w-4 h-4 text-purple-600" />
											<span className="font-medium">Super Admin</span>
										</div>
										<ul className="text-sm text-gray-600 space-y-1">
											<li>• All admin permissions</li>
											<li>• System settings</li>
											<li>• Role management</li>
											<li>• Platform configuration</li>
										</ul>
									</CardContent>
								</Card>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="activity" className="space-y-6">
					<UserActivity userId="" />
				</TabsContent>
			</Tabs>
		</div>
	);
}
