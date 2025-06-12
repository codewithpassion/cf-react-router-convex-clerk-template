import { Heart, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "~/components/ui/tooltip";
import { useVoting } from "~/hooks/use-voting";
import { cn } from "~/lib/utils";

interface VoteButtonProps {
	photoId: string;
	currentVotes: number;
	userHasVoted: boolean;
	canVote: boolean;
	competitionStatus: "open" | "voting" | "closed";
	size?: "sm" | "md" | "lg";
	variant?: "icon" | "button" | "card";
	onVoteChange?: (voted: boolean, newCount: number) => void;
	className?: string;
	disabled?: boolean;
}

export function VoteButton({
	photoId,
	currentVotes,
	userHasVoted,
	canVote,
	competitionStatus,
	size = "md",
	variant = "button",
	onVoteChange,
	className,
	disabled = false,
}: VoteButtonProps) {
	const { useVote, useUnvote } = useVoting();
	const voteMutation = useVote();
	const unvoteMutation = useUnvote();

	// Local optimistic state
	const [optimisticVoted, setOptimisticVoted] = useState(userHasVoted);
	const [optimisticCount, setOptimisticCount] = useState(currentVotes);
	const [isAnimating, setIsAnimating] = useState(false);

	// Determine if voting is allowed
	const votingAllowed = canVote && competitionStatus === "voting" && !disabled;
	const isSubmitting = voteMutation.isPending || unvoteMutation.isPending;

	const handleVote = async () => {
		if (!votingAllowed || isSubmitting) return;

		const wasVoted = optimisticVoted;
		const newVoted = !wasVoted;
		const newCount = wasVoted ? optimisticCount - 1 : optimisticCount + 1;

		// Optimistic update
		setOptimisticVoted(newVoted);
		setOptimisticCount(newCount);
		setIsAnimating(true);

		// Trigger animation
		setTimeout(() => setIsAnimating(false), 300);

		try {
			if (wasVoted) {
				await unvoteMutation.mutateAsync({ photoId });
			} else {
				await voteMutation.mutateAsync({ photoId });
			}

			// Notify parent component
			onVoteChange?.(newVoted, newCount);
		} catch (error) {
			// Rollback optimistic update on error
			setOptimisticVoted(wasVoted);
			setOptimisticCount(optimisticCount);
			console.error("Vote error:", error);
		}
	};

	const getTooltipMessage = () => {
		if (competitionStatus === "open") {
			return "Voting hasn't started yet";
		}
		if (competitionStatus === "closed") {
			return "Voting has ended";
		}
		if (!canVote) {
			return "You cannot vote on this photo";
		}
		if (disabled) {
			return "Voting is disabled";
		}
		return optimisticVoted ? "Remove your vote" : "Vote for this photo";
	};

	const sizeClasses = {
		sm: "h-8 px-2 text-sm",
		md: "h-10 px-4",
		lg: "h-12 px-6 text-lg",
	};

	const iconSizes = {
		sm: "w-3 h-3",
		md: "w-4 h-4",
		lg: "w-5 h-5",
	};

	if (variant === "icon") {
		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							onClick={handleVote}
							disabled={!votingAllowed || isSubmitting}
							className={cn(
								"p-2 transition-all duration-200",
								optimisticVoted && votingAllowed
									? "text-red-500 hover:text-red-600"
									: "text-gray-500 hover:text-gray-700",
								isAnimating && "scale-110",
								className,
							)}
						>
							{isSubmitting ? (
								<Loader2 className={cn(iconSizes[size], "animate-spin")} />
							) : (
								<Heart
									className={cn(
										iconSizes[size],
										"transition-all duration-200",
										optimisticVoted && votingAllowed ? "fill-current" : "",
									)}
								/>
							)}
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>{getTooltipMessage()}</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	if (variant === "card") {
		return (
			<div
				className={cn(
					"flex items-center justify-between p-4 border rounded-lg bg-white transition-all duration-200",
					votingAllowed ? "hover:border-gray-300 cursor-pointer" : "opacity-60",
					className,
				)}
				onClick={handleVote}
			>
				<div className="flex items-center gap-3">
					{isSubmitting ? (
						<Loader2
							className={cn(iconSizes[size], "animate-spin text-gray-500")}
						/>
					) : (
						<Heart
							className={cn(
								iconSizes[size],
								"transition-all duration-200",
								optimisticVoted && votingAllowed
									? "fill-current text-red-500"
									: "text-gray-500",
								isAnimating && "scale-110",
							)}
						/>
					)}
					<div>
						<p className="font-medium">
							{optimisticVoted
								? "You voted for this photo"
								: "Vote for this photo"}
						</p>
						<p className="text-sm text-gray-600">{getTooltipMessage()}</p>
					</div>
				</div>
				<div className="text-right">
					<p className="text-2xl font-bold">{optimisticCount}</p>
					<p className="text-xs text-gray-500">
						{optimisticCount === 1 ? "vote" : "votes"}
					</p>
				</div>
			</div>
		);
	}

	// Default button variant
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant={optimisticVoted && votingAllowed ? "default" : "outline"}
						size={size}
						onClick={handleVote}
						disabled={!votingAllowed || isSubmitting}
						className={cn(
							sizeClasses[size],
							"transition-all duration-200 gap-2",
							optimisticVoted && votingAllowed
								? "bg-red-500 hover:bg-red-600 text-white"
								: "",
							isAnimating && "scale-105",
							className,
						)}
					>
						{isSubmitting ? (
							<Loader2 className={cn(iconSizes[size], "animate-spin")} />
						) : (
							<Heart
								className={cn(
									iconSizes[size],
									"transition-all duration-200",
									optimisticVoted && votingAllowed ? "fill-current" : "",
								)}
							/>
						)}
						<span className="font-medium">{optimisticCount}</span>
						{size !== "sm" && (
							<span className="hidden sm:inline">
								{optimisticVoted ? "Voted" : "Vote"}
							</span>
						)}
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>{getTooltipMessage()}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
