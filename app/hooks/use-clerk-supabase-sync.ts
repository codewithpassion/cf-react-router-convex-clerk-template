import { useUser } from "@clerk/react-router";
import { useEffect, useMemo, useRef } from "react";
import { useSyncUser } from "./use-supabase-query";

/**
 * Hook to automatically sync Clerk user data to Supabase database
 * This ensures the user exists in Supabase when they sign in
 */
export function useClerkSupabaseSync() {
	const { user, isSignedIn, isLoaded } = useUser();
	const syncUser = useSyncUser();
	const lastSyncDataRef = useRef<string | null>(null);

	// Create a stable representation of user data for comparison
	const userSyncData = useMemo(() => {
		if (!user) return null;

		return {
			clerkId: user.id,
			email: user.primaryEmailAddress?.emailAddress || "",
			name: user.fullName || user.firstName || undefined,
			imageUrl: user.imageUrl || undefined,
			roles: (user.publicMetadata?.roles as string[]) || ["user"],
		};
	}, [user]);

	// Serialize user data for comparison
	const userSyncDataString = useMemo(() => {
		return userSyncData ? JSON.stringify(userSyncData) : null;
	}, [userSyncData]);

	useEffect(() => {
		if (!isLoaded || !isSignedIn || !userSyncData || !userSyncDataString) {
			lastSyncDataRef.current = null;
			return;
		}

		// Only sync if the user data has changed
		if (lastSyncDataRef.current === userSyncDataString) {
			return;
		}

		try {
			syncUser.mutate(userSyncData);
			lastSyncDataRef.current = userSyncDataString;
		} catch (error) {
			console.error("Failed to sync user to Supabase:", error);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoaded, isSignedIn, userSyncDataString, userSyncData, syncUser]);
}
