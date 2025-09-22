import type { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import type * as schema from "./schema";

// declare global {
// 	// eslint-disable-next-line no-var
// 	var __db: ReturnType<typeof drizzle> | undefined;
// }

// let db: ReturnType<typeof drizzle>;

// if (typeof window === "undefined") {
// 	// Server-side: use DATABASE_URL from environment
// 	const databaseUrl = process.env.DATABASE_URL;
// 	if (!databaseUrl) {
// 		throw new Error("DATABASE_URL environment variable is required");
// 	}

// 	// Create connection with connection pooling support
// 	// Disable prefetch for Supabase transaction pool mode
// 	// const client = new Pool({
// 	// 	connectionString: process.env.DATABASE_URL,
// 	// });
// 	const client = postgres(databaseUrl, {
// 		prepare: false,
// 		max: 10,
// 	});

// 	if (process.env.NODE_ENV === "production") {
// 		db = drizzle({ client, schema });
// 	} else {
// 		if (!global.__db) {
// 			global.__db = drizzle({ client, schema });
// 		}
// 		db = global.__db;
// 	}
// } else {
// 	// Client-side: This should not be used directly on the client
// 	throw new Error("Database connection should not be used on the client side");
// }

// export { db };
export type Database = ReturnType<typeof drizzle<typeof schema>>;
