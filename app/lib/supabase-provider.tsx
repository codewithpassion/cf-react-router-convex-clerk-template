import { useAuth } from "@clerk/react-router";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Database } from "./database.types";
import { createClient } from "./supabase";

type SupabaseContext = {
	supabase: SupabaseClient<Database>;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export function SupabaseProvider({ children }: { children: ReactNode }) {
	const { getToken } = useAuth();
	const [supabase] = useState(() => createClient());

	useEffect(() => {
		const setSupabaseAccessToken = async () => {
			const token = await getToken({ template: "supabase" });
			if (token) {
				supabase.realtime.setAuth(token);
			}
		};

		setSupabaseAccessToken();
	}, [supabase, getToken]);

	return <Context.Provider value={{ supabase }}>{children}</Context.Provider>;
}

export const useSupabase = () => {
	const context = useContext(Context);

	if (context === undefined) {
		throw new Error("useSupabase must be used inside SupabaseProvider");
	}

	return context;
};
