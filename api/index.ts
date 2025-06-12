import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { Hono } from "hono";
import type { AppType } from "../workers/types";
import { appRouter } from "./trpc/root";
import { createTRPCContext } from "./trpc/trpc";

const app = new Hono<AppType>();

// tRPC endpoint
app.all("/trpc/*", async (c) => {
	const response = await fetchRequestHandler({
		endpoint: "/trpc",
		req: c.req.raw,
		router: appRouter,
		createContext: async () => {
			return createTRPCContext({
				env: c.env,
				executionCtx: c.executionCtx,
				request: c.req.raw,
				user: undefined, // TODO: Extract user from auth headers
			});
		},
	});

	return response;
});

export { app };
