import { adminRouter } from "./routers/admin";
import { competitionRouter } from "./routers/competition";
import { moderationRouter } from "./routers/moderation";
import { photoRouter } from "./routers/photo";
import { votingRouter } from "./routers/voting";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
	photo: photoRouter,
	voting: votingRouter,
	moderation: moderationRouter,
	admin: adminRouter,
	competition: competitionRouter,
});

export type AppRouter = typeof appRouter;
