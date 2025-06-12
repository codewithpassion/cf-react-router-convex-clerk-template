import { zodResolver } from "@hookform/resolvers/zod";
import {
	AlertCircle,
	Calendar,
	FileText,
	Info,
	Plus,
	Settings,
	Trash2,
	Trophy,
} from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "~/components/ui/tooltip";

const competitionSchema = z.object({
	title: z.string().min(3, "Title must be at least 3 characters").max(100),
	description: z
		.string()
		.min(10, "Description must be at least 10 characters")
		.max(2000),
	status: z.enum(["draft", "open", "voting", "closed"]),
	startDate: z.string().min(1, "Start date is required"),
	endDate: z.string().min(1, "End date is required"),
	votingStartDate: z.string().optional(),
	votingEndDate: z.string().optional(),
	maxSubmissionsPerUser: z.number().min(1).max(10),
	allowedFileTypes: z
		.array(z.string())
		.min(1, "At least one file type must be allowed"),
	maxFileSize: z.number().min(1).max(50), // MB
	requiresApproval: z.boolean(),
	allowPublicVoting: z.boolean(),
	featuredPrize: z.string().optional(),
	rules: z.array(z.string()),
	categories: z
		.array(
			z.object({
				name: z.string().min(1, "Category name is required"),
				description: z.string().optional(),
				maxSubmissions: z.number().min(1).max(5).optional(),
				rules: z.array(z.string()).optional(),
				examples: z.array(z.string()).optional(),
			}),
		)
		.min(1, "At least one category is required"),
	judging: z.object({
		type: z.enum(["public", "expert", "hybrid"]),
		criteria: z.array(z.string()),
		expertJudges: z.array(z.string()).optional(),
		publicWeight: z.number().min(0).max(100).optional(),
		expertWeight: z.number().min(0).max(100).optional(),
	}),
	prizes: z
		.array(
			z.object({
				place: z.string(),
				title: z.string(),
				description: z.string().optional(),
				value: z.string().optional(),
			}),
		)
		.optional(),
	tags: z.array(z.string()).optional(),
	isPublic: z.boolean(),
	isRecurring: z.boolean(),
	recurringPattern: z.string().optional(),
});

type CompetitionFormData = z.infer<typeof competitionSchema>;

interface CompetitionFormProps {
	competition?: Partial<CompetitionFormData>;
	mode: "create" | "edit";
	onSubmit: (data: CompetitionFormData) => void;
	onCancel: () => void;
	isSubmitting?: boolean;
}

const defaultValues: CompetitionFormData = {
	title: "",
	description: "",
	status: "draft",
	startDate: "",
	endDate: "",
	votingStartDate: "",
	votingEndDate: "",
	maxSubmissionsPerUser: 3,
	allowedFileTypes: ["image/jpeg", "image/png", "image/webp"],
	maxFileSize: 10,
	requiresApproval: true,
	allowPublicVoting: true,
	featuredPrize: "",
	rules: [
		"Photos must be original work",
		"No editing beyond basic adjustments allowed",
	],
	categories: [{ name: "General", description: "" }],
	judging: {
		type: "public",
		criteria: ["Technical quality", "Creativity", "Composition"],
	},
	prizes: [
		{ place: "1st", title: "First Place", description: "Winner receives..." },
		{
			place: "2nd",
			title: "Second Place",
			description: "Runner-up receives...",
		},
		{
			place: "3rd",
			title: "Third Place",
			description: "Third place receives...",
		},
	],
	tags: [],
	isPublic: true,
	isRecurring: false,
};

export function CompetitionForm({
	competition,
	mode,
	onSubmit,
	onCancel,
	isSubmitting = false,
}: CompetitionFormProps) {
	const [activeTab, setActiveTab] = useState("basic");

	const form = useForm<CompetitionFormData>({
		resolver: zodResolver(competitionSchema),
		defaultValues: { ...defaultValues, ...competition },
	});

	const {
		fields: categoryFields,
		append: appendCategory,
		remove: removeCategory,
	} = useFieldArray({
		control: form.control,
		name: "categories",
	});

	const {
		fields: ruleFields,
		append: appendRule,
		remove: removeRule,
	} = useFieldArray({
		control: form.control,
		name: "rules",
	});

	const {
		fields: prizeFields,
		append: appendPrize,
		remove: removePrize,
	} = useFieldArray({
		control: form.control,
		name: "prizes",
	});

	const fileTypes = [
		{ value: "image/jpeg", label: "JPEG" },
		{ value: "image/png", label: "PNG" },
		{ value: "image/webp", label: "WebP" },
		{ value: "image/tiff", label: "TIFF" },
		{ value: "image/raw", label: "RAW" },
	];

	const judgingCriteria = [
		"Technical quality",
		"Creativity",
		"Composition",
		"Originality",
		"Visual impact",
		"Adherence to theme",
		"Storytelling",
		"Color harmony",
		"Lighting",
		"Post-processing",
	];

	const tabs = [
		{ id: "basic", label: "Basic Info", icon: FileText },
		{ id: "timeline", label: "Timeline", icon: Calendar },
		{ id: "categories", label: "Categories", icon: Trophy },
		{ id: "judging", label: "Judging", icon: Settings },
		{ id: "advanced", label: "Advanced", icon: Settings },
	];

	const renderTabContent = () => {
		switch (activeTab) {
			case "basic":
				return (
					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Competition Title *</FormLabel>
										<FormControl>
											<Input {...field} placeholder="Enter competition title" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="status"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Status</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select status" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="draft">Draft</SelectItem>
												<SelectItem value="open">
													Open for Submissions
												</SelectItem>
												<SelectItem value="voting">Voting Phase</SelectItem>
												<SelectItem value="closed">Closed</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description *</FormLabel>
									<FormControl>
										<Textarea
											{...field}
											placeholder="Describe the competition theme, rules, and prizes..."
											rows={4}
										/>
									</FormControl>
									<FormDescription>
										Provide a detailed description including theme, rules, and
										prizes
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="featuredPrize"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Featured Prize</FormLabel>
									<FormControl>
										<Input
											{...field}
											placeholder="e.g., $500 cash prize or Camera equipment"
										/>
									</FormControl>
									<FormDescription>
										Highlight the main prize to attract participants
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="isPublic"
								render={({ field }) => (
									<FormItem className="flex flex-row items-start space-x-3 space-y-0">
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
										<div className="space-y-1 leading-none">
											<FormLabel>Public Competition</FormLabel>
											<FormDescription>
												Anyone can view and participate in this competition
											</FormDescription>
										</div>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="requiresApproval"
								render={({ field }) => (
									<FormItem className="flex flex-row items-start space-x-3 space-y-0">
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
										<div className="space-y-1 leading-none">
											<FormLabel>Requires Approval</FormLabel>
											<FormDescription>
												Submissions need manual approval before being visible
											</FormDescription>
										</div>
									</FormItem>
								)}
							/>
						</div>
					</div>
				);

			case "timeline":
				return (
					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="startDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Submission Start Date *</FormLabel>
										<FormControl>
											<Input {...field} type="datetime-local" />
										</FormControl>
										<FormDescription>
											When participants can start submitting photos
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="endDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Submission End Date *</FormLabel>
										<FormControl>
											<Input {...field} type="datetime-local" />
										</FormControl>
										<FormDescription>
											Deadline for photo submissions
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="votingStartDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Voting Start Date</FormLabel>
										<FormControl>
											<Input {...field} type="datetime-local" />
										</FormControl>
										<FormDescription>
											When voting phase begins (auto if not set)
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="votingEndDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Voting End Date</FormLabel>
										<FormControl>
											<Input {...field} type="datetime-local" />
										</FormControl>
										<FormDescription>
											When voting phase ends and winners are determined
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="isRecurring"
								render={({ field }) => (
									<FormItem className="flex flex-row items-start space-x-3 space-y-0">
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
										<div className="space-y-1 leading-none">
											<FormLabel>Recurring Competition</FormLabel>
											<FormDescription>
												Automatically create future competitions
											</FormDescription>
										</div>
									</FormItem>
								)}
							/>

							{form.watch("isRecurring") && (
								<FormField
									control={form.control}
									name="recurringPattern"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Recurrence Pattern</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select pattern" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="weekly">Weekly</SelectItem>
													<SelectItem value="monthly">Monthly</SelectItem>
													<SelectItem value="quarterly">Quarterly</SelectItem>
													<SelectItem value="yearly">Yearly</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}
						</div>
					</div>
				);

			case "categories":
				return (
					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-lg font-medium">Competition Categories</h3>
								<p className="text-sm text-gray-600">
									Define categories for photo submissions
								</p>
							</div>
							<Button
								type="button"
								variant="outline"
								onClick={() => appendCategory({ name: "", description: "" })}
							>
								<Plus className="w-4 h-4 mr-2" />
								Add Category
							</Button>
						</div>

						<div className="space-y-4">
							{categoryFields.map((field, index) => (
								<Card key={field.id}>
									<CardContent className="p-4">
										<div className="flex items-start gap-4">
											<div className="flex-1 space-y-4">
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<FormField
														control={form.control}
														name={`categories.${index}.name`}
														render={({ field }) => (
															<FormItem>
																<FormLabel>Category Name *</FormLabel>
																<FormControl>
																	<Input
																		{...field}
																		placeholder="e.g., Nature, Portrait, Street"
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>

													<FormField
														control={form.control}
														name={`categories.${index}.maxSubmissions`}
														render={({ field }) => (
															<FormItem>
																<FormLabel>Max Submissions</FormLabel>
																<FormControl>
																	<Input
																		{...field}
																		type="number"
																		min="1"
																		max="5"
																		onChange={(e) =>
																			field.onChange(Number(e.target.value))
																		}
																		placeholder="3"
																	/>
																</FormControl>
																<FormDescription>
																	Max photos per user in this category
																</FormDescription>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>

												<FormField
													control={form.control}
													name={`categories.${index}.description`}
													render={({ field }) => (
														<FormItem>
															<FormLabel>Description</FormLabel>
															<FormControl>
																<Textarea
																	{...field}
																	placeholder="Describe this category's theme and requirements..."
																	rows={3}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>

											{categoryFields.length > 1 && (
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => removeCategory(index)}
													className="text-red-600 hover:text-red-700"
												>
													<Trash2 className="w-4 h-4" />
												</Button>
											)}
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				);

			case "judging":
				return (
					<div className="space-y-6">
						<FormField
							control={form.control}
							name="judging.type"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Judging Type</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select judging type" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="public">Public Voting Only</SelectItem>
											<SelectItem value="expert">Expert Judges Only</SelectItem>
											<SelectItem value="hybrid">
												Hybrid (Public + Expert)
											</SelectItem>
										</SelectContent>
									</Select>
									<FormDescription>
										How will winners be determined?
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="allowPublicVoting"
							render={({ field }) => (
								<FormItem className="flex flex-row items-start space-x-3 space-y-0">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<div className="space-y-1 leading-none">
										<FormLabel>Allow Public Voting</FormLabel>
										<FormDescription>
											Let anyone vote on submissions
										</FormDescription>
									</div>
								</FormItem>
							)}
						/>

						<div>
							<FormLabel>Judging Criteria</FormLabel>
							<FormDescription className="mb-3">
								Select criteria that will be used to evaluate submissions
							</FormDescription>
							<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
								{judgingCriteria.map((criterion) => (
									<FormField
										key={criterion}
										control={form.control}
										name="judging.criteria"
										render={({ field }) => (
											<FormItem
												key={criterion}
												className="flex flex-row items-start space-x-3 space-y-0"
											>
												<FormControl>
													<Checkbox
														checked={field.value?.includes(criterion)}
														onCheckedChange={(checked) => {
															if (checked) {
																field.onChange([...field.value, criterion]);
															} else {
																field.onChange(
																	field.value?.filter(
																		(value) => value !== criterion,
																	),
																);
															}
														}}
													/>
												</FormControl>
												<FormLabel className="text-sm font-normal">
													{criterion}
												</FormLabel>
											</FormItem>
										)}
									/>
								))}
							</div>
						</div>

						<div>
							<div className="flex items-center justify-between mb-3">
								<div>
									<FormLabel>Competition Rules</FormLabel>
									<FormDescription>
										Rules and guidelines for participants
									</FormDescription>
								</div>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => appendRule("")}
								>
									<Plus className="w-4 h-4 mr-2" />
									Add Rule
								</Button>
							</div>

							<div className="space-y-2">
								{ruleFields.map((field, index) => (
									<div key={field.id} className="flex gap-2">
										<FormField
											control={form.control}
											name={`rules.${index}`}
											render={({ field }) => (
												<FormItem className="flex-1">
													<FormControl>
														<Input
															{...field}
															placeholder="Enter a rule or guideline..."
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => removeRule(index)}
											className="text-red-600 hover:text-red-700"
										>
											<Trash2 className="w-4 h-4" />
										</Button>
									</div>
								))}
							</div>
						</div>
					</div>
				);

			case "advanced":
				return (
					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="maxSubmissionsPerUser"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Max Submissions per User</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="number"
												min="1"
												max="10"
												onChange={(e) => field.onChange(Number(e.target.value))}
											/>
										</FormControl>
										<FormDescription>
											Total photos each user can submit
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="maxFileSize"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Max File Size (MB)</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="number"
												min="1"
												max="50"
												onChange={(e) => field.onChange(Number(e.target.value))}
											/>
										</FormControl>
										<FormDescription>
											Maximum file size for uploads
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div>
							<FormLabel>Allowed File Types</FormLabel>
							<FormDescription className="mb-3">
								Select which image formats are allowed
							</FormDescription>
							<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
								{fileTypes.map((type) => (
									<FormField
										key={type.value}
										control={form.control}
										name="allowedFileTypes"
										render={({ field }) => (
											<FormItem
												key={type.value}
												className="flex flex-row items-start space-x-3 space-y-0"
											>
												<FormControl>
													<Checkbox
														checked={field.value?.includes(type.value)}
														onCheckedChange={(checked) => {
															if (checked) {
																field.onChange([...field.value, type.value]);
															} else {
																field.onChange(
																	field.value?.filter(
																		(value) => value !== type.value,
																	),
																);
															}
														}}
													/>
												</FormControl>
												<FormLabel className="text-sm font-normal">
													{type.label}
												</FormLabel>
											</FormItem>
										)}
									/>
								))}
							</div>
						</div>

						<Separator />

						<div>
							<div className="flex items-center justify-between mb-3">
								<div>
									<FormLabel>Prizes & Awards</FormLabel>
									<FormDescription>Define prizes for winners</FormDescription>
								</div>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() =>
										appendPrize({ place: "", title: "", description: "" })
									}
								>
									<Plus className="w-4 h-4 mr-2" />
									Add Prize
								</Button>
							</div>

							<div className="space-y-4">
								{prizeFields.map((field, index) => (
									<Card key={field.id}>
										<CardContent className="p-4">
											<div className="flex items-start gap-4">
												<div className="flex-1 space-y-4">
													<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
														<FormField
															control={form.control}
															name={`prizes.${index}.place`}
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Place</FormLabel>
																	<FormControl>
																		<Input
																			{...field}
																			placeholder="1st, 2nd, 3rd..."
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>

														<FormField
															control={form.control}
															name={`prizes.${index}.title`}
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Prize Title</FormLabel>
																	<FormControl>
																		<Input
																			{...field}
																			placeholder="First Place Winner"
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>

														<FormField
															control={form.control}
															name={`prizes.${index}.value`}
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Value</FormLabel>
																	<FormControl>
																		<Input
																			{...field}
																			placeholder="$500, Camera, etc."
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
													</div>

													<FormField
														control={form.control}
														name={`prizes.${index}.description`}
														render={({ field }) => (
															<FormItem>
																<FormLabel>Description</FormLabel>
																<FormControl>
																	<Textarea
																		{...field}
																		placeholder="Describe the prize details..."
																		rows={2}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>

												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => removePrize(index)}
													className="text-red-600 hover:text-red-700"
												>
													<Trash2 className="w-4 h-4" />
												</Button>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</div>
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<TooltipProvider>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
					{/* Tab Navigation */}
					<Card>
						<CardContent className="p-0">
							<div className="flex overflow-x-auto">
								{tabs.map((tab) => {
									const Icon = tab.icon;
									return (
										<button
											key={tab.id}
											type="button"
											onClick={() => setActiveTab(tab.id)}
											className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
												activeTab === tab.id
													? "border-blue-500 text-blue-600"
													: "border-transparent text-gray-500 hover:text-gray-700"
											}`}
										>
											<Icon className="w-4 h-4" />
											{tab.label}
										</button>
									);
								})}
							</div>
						</CardContent>
					</Card>

					{/* Tab Content */}
					<Card>
						<CardContent className="p-6">{renderTabContent()}</CardContent>
					</Card>

					{/* Form Actions */}
					<div className="flex justify-end gap-4">
						<Button type="button" variant="outline" onClick={onCancel}>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full" />
									{mode === "create" ? "Creating..." : "Updating..."}
								</>
							) : (
								<>
									{mode === "create"
										? "Create Competition"
										: "Update Competition"}
								</>
							)}
						</Button>
					</div>
				</form>
			</Form>
		</TooltipProvider>
	);
}
