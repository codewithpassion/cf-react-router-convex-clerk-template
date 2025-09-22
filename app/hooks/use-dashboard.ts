import { useAdminStats } from "./use-supabase-query";

export function useDashboard() {
	return {
		// Dashboard overview - using Supabase with React Query
		useOverview: () => {
			const { data, isLoading, error, refetch, isRefetching } = useAdminStats();
			return {
				data,
				isLoading,
				error: error ? { message: error.message } : null,
				refetch,
				isRefetching,
			};
		},
	};
}
