import { createBrowserClient, createServerClient } from "@supabase/ssr";
import type { Database } from "./database.types";

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error("Missing Supabase environment variables");
}

// Browser client for client-side operations
export const createClient = () =>
	createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

// Server client for SSR operations
export const createServerSupabaseClient = (
	getCookie: (name: string) => string | undefined,
	setCookie: (name: string, value: string, options?: unknown) => void,
) =>
	createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
		cookies: {
			get: getCookie,
			set: setCookie,
		},
	});

// Default browser client instance
export const supabase = createClient();
