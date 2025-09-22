import { drizzle } from "drizzle-orm/postgres-js";
import { createMiddleware } from "hono/factory";
import postgres from "postgres";
import * as schema from "~/lib/db/schema";
import type { AppType } from "./types";

export const dbMiddleware = createMiddleware<AppType>(async (c, next) => {
	const client = postgres(c.env.DATABASE_URL, {
		prepare: false,
		max: 10,
	});
	const database = drizzle({ client, schema });
	c.set("DB", database);
	await next();
});
