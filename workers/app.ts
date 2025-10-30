/// <reference path="../worker-configuration.d.ts" />
import { Hono } from "hono";
import { cors } from "hono/cors";
import { RouterContextProvider, createRequestHandler } from "react-router";
import type { AppType } from "./types";

export type CloudflareContextType = {
	env: CloudflareBindings;
	var: CloudflareVariables;
	ctx: ExecutionContext;
};

declare module "react-router" {
	export interface RouterContextProvider {
		cloudflare: CloudflareContextType;
	}
}

const requestHandler = createRequestHandler(
	// @ts-ignore
	() => import("virtual:react-router/server-build"),
	import.meta.env.MODE,
);

const app = new Hono<AppType>();

// CORS configuration for API routes
app.use(
	"/api/*",
	cors({
		origin: (origin) => {
			// Allow all origins in development
			if (import.meta.env.DEV) return origin || "*";

			// Configure allowed origins for production
			const allowedOrigins = [
				"https://your-domain.com",
				"https://www.your-domain.com",
			];

			return allowedOrigins.includes(origin || "") ? origin : "";
		},
		credentials: true,
	}),
);

app.get("/api/health", (c) => {
	return c.json({ status: "ok" });
});

app.use(async (c) => {
	const cloudflareContextValue: CloudflareContextType = {
		env: c.env,
		var: c.var,
		ctx: c.executionCtx,
	};
	const rCotnextProvider = new RouterContextProvider();
	rCotnextProvider.cloudflare = cloudflareContextValue;

	return requestHandler(c.req.raw, rCotnextProvider);
});

export default {
	fetch: app.fetch,
} satisfies ExportedHandler<CloudflareEnvironment>;
