import { useState } from "react";
import { trpc } from "~/lib/trpc";

// Admin dashboard stats hook
export function useAdminStats() {
	return trpc.admin.getStats.useQuery();
}

// Recent activity hook
export function useRecentActivity(options?: { limit?: number }) {
	return trpc.admin.getRecentActivity.useQuery({
		limit: options?.limit || 10,
	});
}

// System health monitoring
export function useSystemHealth() {
	return trpc.admin.getSystemHealth.useQuery();
}

// Competition management hooks
export function useAllCompetitions(filters?: {
	status?: string;
	sort?: string;
	search?: string;
}) {
	return trpc.admin.getAllCompetitions.useQuery(filters);
}

export function useCreateCompetition() {
	return trpc.admin.createCompetition.useMutation();
}

export function useUpdateCompetition() {
	return trpc.admin.updateCompetition.useMutation();
}

export function useDeleteCompetition() {
	return trpc.admin.deleteCompetition.useMutation();
}

export function useBulkUpdateCompetitions() {
	return trpc.admin.bulkUpdateCompetitions.useMutation();
}

// Moderation hooks
export function usePendingPhotos(filters?: {
	categoryId?: string;
	sort?: string;
}) {
	return trpc.admin.getPendingPhotos.useQuery(filters);
}

export function useModeratePhoto() {
	return trpc.admin.moderatePhoto.useMutation();
}

export function useBulkModeratePhotos() {
	return trpc.admin.bulkModeratePhotos.useMutation();
}

export function useModerationStats() {
	return trpc.admin.getModerationStats.useQuery();
}

// User management hooks
export function useAllUsers(filters?: {
	role?: string;
	status?: string;
	search?: string;
}) {
	return trpc.admin.getAllUsers.useQuery(filters);
}

export function useUpdateUserRole() {
	return trpc.admin.updateUserRole.useMutation();
}

export function useBanUser() {
	return trpc.admin.banUser.useMutation();
}

export function useBulkUpdateUsers() {
	return trpc.admin.bulkUpdateUsers.useMutation();
}

export function useUserStats() {
	return trpc.admin.getUserStats.useQuery();
}

// Analytics hooks
export function useAnalytics(options: {
	from: Date;
	to: Date;
	metrics: string[];
}) {
	return trpc.admin.getAnalytics.useQuery(options);
}

export function useGenerateReport() {
	return trpc.admin.generateReport.useMutation();
}

// Settings hooks
export function usePlatformSettings() {
	return trpc.admin.getSettings.useQuery();
}

export function useUpdateSettings() {
	return trpc.admin.updateSettings.useMutation();
}

// Competition status management hook
export function useCompetitionStatusManager(competitionId: string) {
	const [isChangingStatus, setIsChangingStatus] = useState(false);
	const updateMutation = useUpdateCompetition();

	const changeStatus = async (newStatus: string) => {
		setIsChangingStatus(true);
		try {
			await updateMutation.mutateAsync({
				id: competitionId,
				status: newStatus,
			});
		} finally {
			setIsChangingStatus(false);
		}
	};

	return {
		changeStatus,
		isChangingStatus,
	};
}

// Bulk actions hook for managing multiple items
export function useBulkActions<T extends { id: string }>() {
	const [selectedItems, setSelectedItems] = useState<string[]>([]);
	const [isSelectAll, setIsSelectAll] = useState(false);

	const toggleItem = (itemId: string) => {
		setSelectedItems((prev) =>
			prev.includes(itemId)
				? prev.filter((id) => id !== itemId)
				: [...prev, itemId],
		);
	};

	const toggleAll = (items: T[]) => {
		if (isSelectAll) {
			setSelectedItems([]);
			setIsSelectAll(false);
		} else {
			setSelectedItems(items.map((item) => item.id));
			setIsSelectAll(true);
		}
	};

	const clearSelection = () => {
		setSelectedItems([]);
		setIsSelectAll(false);
	};

	const isSelected = (itemId: string) => selectedItems.includes(itemId);

	return {
		selectedItems,
		isSelectAll,
		toggleItem,
		toggleAll,
		clearSelection,
		isSelected,
		selectedCount: selectedItems.length,
	};
}

// Quick actions hook for dashboard
export function useQuickActions() {
	const createCompetition = useCreateCompetition();
	const moderatePhoto = useModeratePhoto();

	const quickCreateCompetition = async (data: any) => {
		return createCompetition.mutateAsync(data);
	};

	const quickModeratePhoto = async (
		photoId: string,
		action: "approve" | "reject",
	) => {
		return moderatePhoto.mutateAsync({
			photoId,
			action,
			reason: action === "reject" ? "Quick moderation" : undefined,
		});
	};

	return {
		quickCreateCompetition,
		quickModeratePhoto,
		isCreatingCompetition: createCompetition.isPending,
		isModerating: moderatePhoto.isPending,
	};
}

// Real-time notifications hook for admin
export function useAdminNotifications() {
	const [notifications, setNotifications] = useState<
		Array<{
			id: string;
			type: "moderation" | "competition" | "user" | "system";
			title: string;
			message: string;
			timestamp: Date;
			read: boolean;
		}>
	>([]);

	// Subscribe to admin notifications
	trpc.admin.subscribeToNotifications.useSubscription(undefined, {
		onData: (notification) => {
			setNotifications((prev) => [notification, ...prev.slice(0, 99)]);
		},
	});

	const markAsRead = (notificationId: string) => {
		setNotifications((prev) =>
			prev.map((notif) =>
				notif.id === notificationId ? { ...notif, read: true } : notif,
			),
		);
	};

	const markAllAsRead = () => {
		setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
	};

	const unreadCount = notifications.filter((n) => !n.read).length;

	return {
		notifications,
		unreadCount,
		markAsRead,
		markAllAsRead,
	};
}

// Admin permissions hook
export function useAdminPermissions() {
	const { data: user } = trpc.auth.getUser.useQuery();

	const hasPermission = (permission: string) => {
		if (!user || !user.role) return false;

		// Super admin has all permissions
		if (user.role === "super_admin") return true;

		// Admin has most permissions
		if (user.role === "admin") {
			const restrictedPermissions = ["system_settings", "user_management"];
			return !restrictedPermissions.includes(permission);
		}

		// Moderator has limited permissions
		if (user.role === "moderator") {
			const allowedPermissions = ["moderation", "view_analytics"];
			return allowedPermissions.includes(permission);
		}

		return false;
	};

	const canModerate = hasPermission("moderation");
	const canManageCompetitions = hasPermission("competition_management");
	const canManageUsers = hasPermission("user_management");
	const canViewAnalytics = hasPermission("view_analytics");
	const canChangeSettings = hasPermission("system_settings");

	return {
		hasPermission,
		canModerate,
		canManageCompetitions,
		canManageUsers,
		canViewAnalytics,
		canChangeSettings,
		isAdmin: user?.role === "admin" || user?.role === "super_admin",
		isSuperAdmin: user?.role === "super_admin",
		isModerator: user?.role === "moderator",
	};
}

// Export commonly used combinations
export const useAdmin = {
	useStats: useAdminStats,
	useRecentActivity,
	useSystemHealth,
	useAllCompetitions,
	useCreateCompetition,
	useUpdateCompetition,
	useDeleteCompetition,
	useBulkUpdateCompetitions,
	usePendingPhotos,
	useModeratePhoto,
	useBulkModeratePhotos,
	useModerationStats,
	useAllUsers,
	useUpdateUserRole,
	useBanUser,
	useBulkUpdateUsers,
	useUserStats,
	useAnalytics,
	useGenerateReport,
	usePlatformSettings,
	useUpdateSettings,
};
