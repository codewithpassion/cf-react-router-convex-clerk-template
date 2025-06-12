import { useLoaderData, useRouteLoaderData } from "react-router";
import type { loader } from "~/root";

export function useAuth() {
	const { session } = useRouteLoaderData<typeof loader>("root") || {
		session: undefined,
	};
	const user = session?.user;

	return {
		user,
		isAuthenticated: !!user,
		isAdmin: user?.role === "admin",
		isSuperAdmin: user?.role === "super-admin",
		isVerified: user?.emailVerified || false,
		session,
	};
}
