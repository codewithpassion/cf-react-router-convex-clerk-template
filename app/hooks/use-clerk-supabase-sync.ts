import { useUser } from "@clerk/react-router";
import { useEffect } from "react";
import { useSyncUser } from "./use-supabase-query";

/**
 * Hook to automatically sync Clerk user data to Supabase database
 * This ensures the user exists in Supabase when they sign in
 */
export function useClerkSupabaseSync() {
	const { user, isSignedIn, isLoaded } = useUser();
	const syncUser = useSyncUser();

	useEffect(() => {
		if (!isLoaded || !isSignedIn || !user) {
			return;
		}

		// Sync user data to Supabase
		const sync = () => {
			try {
				const roles = (user.publicMetadata?.roles as string[]) || ["user"];
				syncUser.mutate({
					clerkId: user.id,
					email: user.primaryEmailAddress?.emailAddress || "",
					name: user.fullName || user.firstName || undefined,
					imageUrl: user.imageUrl || undefined,
					roles,
				});
			} catch (error) {
				console.error("Failed to sync user to Supabase:", error);
			}
		};

		sync();
	}, [user, isSignedIn, isLoaded, syncUser]);
}
