import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { idSchema, paginationSchema } from "../schemas/common";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

// Public competition queries
export const competitionRouter = createTRPCRouter({
	// Get all competitions (public)
	getAll: publicProcedure
		.input(
			z.object({
				status: z.enum(["draft", "open", "voting", "closed"]).optional(),
				featured: z.boolean().optional(),
				limit: z.number().min(1).max(50).default(20),
				offset: z.number().min(0).default(0),
			}),
		)
		.query(async ({ ctx, input }) => {
			// TODO: Implement actual competitions query
			return {
				competitions: [
					{
						id: "1",
						title: "Nature Photography Contest",
						description: "Capture the beauty of nature in all its forms",
						status: "open" as const,
						startDate: new Date("2024-01-01"),
						endDate: new Date("2024-02-28"),
						votingStartDate: new Date("2024-03-01"),
						votingEndDate: new Date("2024-03-15"),
						featured: true,
						maxPhotosPerUser: 3,
						_count: {
							photos: 45,
							votes: 892,
						},
						categories: [
							{
								id: "1",
								name: "Landscapes",
								description: "Natural landscapes and scenery",
							},
							{
								id: "2",
								name: "Wildlife",
								description: "Animals in their natural habitat",
							},
						],
					},
					{
						id: "2",
						title: "Street Photography Challenge",
						description: "Document life as it happens on the streets",
						status: "voting" as const,
						startDate: new Date("2024-02-01"),
						endDate: new Date("2024-03-15"),
						votingStartDate: new Date("2024-03-16"),
						votingEndDate: new Date("2024-03-30"),
						featured: false,
						maxPhotosPerUser: 5,
						_count: {
							photos: 78,
							votes: 1245,
						},
						categories: [
							{
								id: "3",
								name: "Urban Life",
								description: "City life and urban environments",
							},
						],
					},
				],
				total: 2,
				limit: input.limit,
				offset: input.offset,
			};
		}),

	// Get competition by ID (public)
	getById: publicProcedure
		.input(z.object({ id: idSchema }))
		.query(async ({ ctx, input }) => {
			// TODO: Implement actual competition query
			if (input.id === "1") {
				return {
					id: "1",
					title: "Nature Photography Contest",
					description:
						"Capture the beauty of nature in all its forms. From majestic landscapes to intimate wildlife moments, show us the natural world through your unique perspective.",
					status: "open" as const,
					startDate: new Date("2024-01-01"),
					endDate: new Date("2024-02-28"),
					votingStartDate: new Date("2024-03-01"),
					votingEndDate: new Date("2024-03-15"),
					featured: true,
					maxPhotosPerUser: 3,
					rules: [
						"Photos must be taken by the submitter",
						"No AI-generated or heavily manipulated images",
						"Maximum 3 submissions per photographer",
						"Images must be captured after competition start date",
					],
					prizes: [
						"Grand Prize: $1,000 cash prize",
						"Second Place: $500 cash prize",
						"Third Place: $250 cash prize",
					],
					judges: [
						{
							id: "judge1",
							name: "Sarah Wilson",
							bio: "Professional nature photographer with 15 years experience",
							avatar: "/judges/sarah.jpg",
						},
					],
					categories: [
						{
							id: "1",
							name: "Landscapes",
							description: "Natural landscapes and scenery",
							rules: [
								"Focus on natural landscapes",
								"Minimal processing allowed",
								"No composite images",
							],
							examples: ["Mountains", "Forests", "Coastlines"],
							_count: { submissions: 23 },
						},
						{
							id: "2",
							name: "Wildlife",
							description: "Animals in their natural habitat",
							rules: [
								"Animals must be in natural habitat",
								"No captive animals",
								"Respect wildlife guidelines",
							],
							examples: ["Birds", "Mammals", "Marine Life"],
							_count: { submissions: 22 },
						},
					],
					_count: {
						submissions: 45,
						votes: 892,
						participants: 38,
					},
					createdAt: new Date("2023-12-01"),
					updatedAt: new Date("2024-01-15"),
				};
			}
			if (input.id === "2") {
				return {
					id: "2",
					title: "Street Photography Challenge",
					description: "Document life as it happens on the streets",
					status: "voting" as const,
					startDate: new Date("2024-02-01"),
					endDate: new Date("2024-03-15"),
					votingStartDate: new Date("2024-03-16"),
					votingEndDate: new Date("2024-03-30"),
					featured: false,
					maxPhotosPerUser: 5,
					rules: [
						"All photos must be taken in a public space.",
						"Respect privacy and local laws.",
						"Submissions should be in black and white.",
					],
					prizes: ["First Prize: Camera Bag", "Second Prize: $100 Gift Card"],
					categories: [
						{
							id: "3",
							name: "Urban Life",
							description: "City life and urban environments",
							_count: { submissions: 78 },
						},
					],
					_count: {
						submissions: 78,
						votes: 1245,
						participants: 62,
					},
					createdAt: new Date("2024-01-15"),
					updatedAt: new Date("2024-02-01"),
				};
			}

			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Competition not found",
			});
		}),

	// Get competition photos (public)
	getPhotos: publicProcedure
		.input(
			z.object({
				competitionId: idSchema,
				categoryId: idSchema.optional(),
				sortBy: z.enum(["votes", "date", "random"]).default("votes"),
				limit: z.number().min(1).max(100).default(20),
				offset: z.number().min(0).default(0),
			}),
		)
		.query(async ({ ctx, input }) => {
			// TODO: Implement actual photos query
			return {
				photos: [
					{
						id: "photo1",
						title: "Mountain Sunrise",
						description:
							"Captured this stunning sunrise from the peak of Mount Washington",
						filePath: "/photos/photo1.jpg",
						categoryId: "1",
						categoryName: "Landscapes",
						photographer: {
							id: "user1",
							name: "John Doe",
							avatar: "/avatars/john.jpg",
						},
						voteCount: 89,
						userHasVoted: false,
						submittedAt: new Date("2024-01-15"),
					},
				],
				total: 1,
				limit: input.limit,
				offset: input.offset,
			};
		}),

	// Get featured competitions
	getFeatured: publicProcedure
		.input(z.object({ limit: z.number().min(1).max(10).default(3) }))
		.query(async ({ ctx, input }) => {
			// TODO: Implement actual featured competitions query
			return [
				{
					id: "1",
					title: "Nature Photography Contest",
					description: "Capture the beauty of nature",
					status: "open" as const,
					endDate: new Date("2024-02-28"),
					_count: { submissions: 45 },
					featuredImage: "/competitions/nature-banner.jpg",
				},
			];
		}),

	// Get user's participation in competitions (protected)
	getUserParticipation: protectedProcedure
		.input(z.object({ competitionId: idSchema.optional() }))
		.query(async ({ ctx, input }) => {
			// TODO: Implement actual user participation query
			return {
				competitions: [
					{
						competitionId: "1",
						competitionTitle: "Nature Photography Contest",
						submissionCount: 2,
						maxSubmissions: 3,
						submissions: [
							{
								id: "photo1",
								title: "Mountain Sunrise",
								categoryId: "1",
								categoryName: "Landscapes",
								status: "approved",
								voteCount: 89,
							},
						],
					},
				],
			};
		}),

	// Get competition submission requirements (public)
	getSubmissionRequirements: publicProcedure
		.input(z.object({ id: idSchema }))
		.query(async ({ ctx, input }) => {
			// TODO: Implement actual submission requirements query
			return {
				maxPhotosPerUser: 3,
				allowedFileTypes: ["image/jpeg", "image/png"],
				maxFileSize: 10485760, // 10MB
				minDimensions: { width: 1920, height: 1080 },
				categories: [
					{
						id: "1",
						name: "Landscapes",
						submissionCount: 23,
						maxSubmissions: null,
					},
					{
						id: "2",
						name: "Wildlife",
						submissionCount: 22,
						maxSubmissions: null,
					},
				],
				requiresApproval: true,
				submissionDeadline: new Date("2024-02-28"),
			};
		}),

	// Get competition statistics (public)
	getStats: publicProcedure
		.input(z.object({ id: idSchema }))
		.query(async ({ ctx, input }) => {
			// TODO: Implement actual statistics query
			return {
				totalSubmissions: 45,
				totalVotes: 892,
				totalParticipants: 38,
				averageVotesPerPhoto: 19.8,
				topCategories: [
					{ categoryId: "1", name: "Landscapes", submissions: 23 },
					{ categoryId: "2", name: "Wildlife", submissions: 22 },
				],
				recentActivity: [
					{
						type: "submission",
						message: "New photo submitted",
						timestamp: new Date(Date.now() - 1000 * 60 * 30),
					},
				],
			};
		}),

	// Search competitions (public)
	search: publicProcedure
		.input(
			z.object({
				query: z.string().min(1),
				status: z.enum(["draft", "open", "voting", "closed"]).optional(),
				limit: z.number().min(1).max(50).default(20),
			}),
		)
		.query(async ({ ctx, input }) => {
			// TODO: Implement actual search
			return {
				competitions: [],
				total: 0,
				query: input.query,
			};
		}),
});
