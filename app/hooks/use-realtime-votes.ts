import { useEffect, useState } from "react";
import { trpc } from "~/lib/trpc";

export function useRealtimeVotes(photoId: string) {
	const [votes, setVotes] = useState<number>(0);
	const [userHasVoted, setUserHasVoted] = useState<boolean>(false);

	const {
		data: initialState,
		refetch,
		isLoading,
	} = trpc.voting.getVoteStatus.useQuery(
		{ photoId },
		{
			enabled: !!photoId,
			refetchInterval: 5000,
		},
	);

	useEffect(() => {
		if (initialState) {
			setVotes(initialState.voteCount);
			setUserHasVoted(initialState.userHasVoted);
		}
	}, [initialState]);

	const refreshVotes = async () => {
		try {
			const result = await refetch();
			if (result.data) {
				setVotes(result.data.voteCount);
				setUserHasVoted(result.data.userHasVoted);
			}
		} catch (error) {
			console.error("Error refreshing votes:", error);
		}
	};

	return {
		votes,
		userHasVoted,
		refreshVotes,
		isLoading,
	};
}

export function useRealtimeCompetitionVotes(competitionId: string) {
	const [photoVotes, setPhotoVotes] = useState<Map<string, number>>(new Map());
	const [userVotes, setUserVotes] = useState<Set<string>>(new Set());

	const { data, error } = trpc.voting.getPhotosWithVotes.useQuery(
		{ competitionId, limit: 1000 },
		{
			enabled: !!competitionId,
			refetchInterval: 5000,
		},
	);

	useEffect(() => {
		if (error) {
			console.error("Competition vote polling error:", error);
		}
		if (data?.photos) {
			const newPhotoVotes = new Map<string, number>();
			const newUserVotes = new Set<string>();
			// biome-ignore lint/suspicious/noExplicitAny: Bypassing a tRPC type inference issue
			for (const photo of data.photos as any[]) {
				newPhotoVotes.set(photo.id, photo.voteCount);
				if (photo.userHasVoted) {
					newUserVotes.add(photo.id);
				}
			}
			setPhotoVotes(newPhotoVotes);
			setUserVotes(newUserVotes);
		}
	}, [data, error]);

	const getPhotoVotes = (photoId: string) => photoVotes.get(photoId) || 0;
	const hasUserVoted = (photoId: string) => userVotes.has(photoId);

	return {
		getPhotoVotes,
		hasUserVoted,
		photoVotes,
		userVotes,
	};
}

export function useRealtimeLeaderboard(
	competitionId: string,
	categoryId?: string,
) {
	const [leaderboard, setLeaderboard] = useState<
		Array<{
			id: string;
			title: string;
			filePath: string;
			voteCount: number;
			photographer: {
				id: string;
				name: string;
			};
		}>
	>([]);

	const { data, error } = trpc.voting.getTopPhotos.useQuery(
		{ competitionId, categoryId, limit: 10 },
		{
			enabled: !!competitionId,
			refetchInterval: 5000,
		},
	);

	useEffect(() => {
		if (error) {
			console.error("Leaderboard polling error:", error);
		}
		if (data?.photos) {
			// biome-ignore lint/suspicious/noExplicitAny: Bypassing a tRPC type inference issue
			const formattedLeaderboard = (data.photos as any[]).map((photo) => ({
				id: photo.id,
				title: photo.title,
				filePath: photo.filePath,
				voteCount: photo.voteCount,
				photographer: {
					id: photo.photographer.id,
					name: "Unknown",
				},
			}));
			setLeaderboard(formattedLeaderboard);
		}
	}, [data, error]);

	return {
		leaderboard,
	};
}

export function useVoteAnimation() {
	const [animatingPhotos, setAnimatingPhotos] = useState<Set<string>>(
		new Set(),
	);

	const triggerVoteAnimation = (photoId: string) => {
		setAnimatingPhotos((prev) => new Set(prev).add(photoId));

		setTimeout(() => {
			setAnimatingPhotos((prev) => {
				const newSet = new Set(prev);
				newSet.delete(photoId);
				return newSet;
			});
		}, 500);
	};

	const isAnimating = (photoId: string) => animatingPhotos.has(photoId);

	return {
		triggerVoteAnimation,
		isAnimating,
	};
}

export function useBatchVotes() {
	const [pendingVotes, setPendingVotes] = useState<Map<string, boolean>>(
		new Map(),
	);
	const voteMutation = trpc.voting.castVote.useMutation();

	const addToBatch = (photoId: string, vote: boolean) => {
		setPendingVotes((prev) => new Map(prev).set(photoId, vote));
	};

	const clearBatch = () => {
		setPendingVotes(new Map());
	};

	const executeBatch = async () => {
		const votePromises = Array.from(pendingVotes.entries()).map(
			async ([photoId, shouldVote]) => {
				try {
					if (shouldVote) {
						await voteMutation.mutateAsync({ photoId });
					}
					return { photoId, success: true };
				} catch (error) {
					return {
						photoId,
						success: false,
						error: error instanceof Error ? error.message : "Unknown error",
					};
				}
			},
		);

		const results = await Promise.all(votePromises);
		clearBatch();
		return results;
	};

	return {
		pendingVotes,
		addToBatch,
		clearBatch,
		executeBatch,
		hasPendingVotes: pendingVotes.size > 0,
	};
}
