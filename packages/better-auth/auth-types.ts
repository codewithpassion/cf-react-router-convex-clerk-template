import type { auth } from "./auth";

export type Session = typeof auth.$Infer.Session;

export interface MySession extends Session {
	user: {
		id: string;
		name: string;
		email: string;
		emailVerified: boolean;
		createdAt: Date;
		updatedAt: Date;
		image?: string | null;
		banned: boolean | null;
		role?: "super-admin" | "admin" | "user";
		banReason?: string | null;
		banExpires?: Date | null;
	};
}
