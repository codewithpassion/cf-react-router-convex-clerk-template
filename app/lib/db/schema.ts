import { relations } from "drizzle-orm";
import {
	boolean,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

// Users table (synced from Clerk)
export const users = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),
	clerkId: text("clerk_id").notNull().unique(),
	email: text("email").notNull().unique(),
	name: text("name"),
	imageUrl: text("image_url"),
	roles: text("roles").array().default(["user"]).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

// Todos table
export const todos = pgTable("todos", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	text: text("text").notNull(),
	completed: boolean("completed").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

// LeasePoints platform tables (as per PRD)

// Tenants table
export const tenants = pgTable("tenants", {
	id: uuid("id").primaryKey().defaultRandom(),
	legalName: text("legal_name").notNull(),
	email: text("email").notNull(),
	abn: text("abn"),
	stripeCustomerId: text("stripe_customer_id"),
	defaultPaymentMethodId: text("default_payment_method_id"),
	timezone: text("timezone").default("Australia/Sydney").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

// Agencies table
export const agencies = pgTable("agencies", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	abn: text("abn"),
	stripeAccountId: text("stripe_account_id"),
	onboardingStatus: text("onboarding_status").default("pending").notNull(),
	payoutSchedule: text("payout_schedule").default("weekly").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

// Properties table
export const properties = pgTable("properties", {
	id: uuid("id").primaryKey().defaultRandom(),
	agencyId: uuid("agency_id")
		.notNull()
		.references(() => agencies.id, { onDelete: "cascade" }),
	addressLine: text("address_line").notNull(),
	suburb: text("suburb").notNull(),
	state: text("state").notNull(),
	postcode: text("postcode").notNull(),
	externalRef: text("external_ref"),
});

// Leases table
export const leases = pgTable("leases", {
	id: uuid("id").primaryKey().defaultRandom(),
	propertyId: uuid("property_id")
		.notNull()
		.references(() => properties.id, { onDelete: "cascade" }),
	tenantId: uuid("tenant_id")
		.notNull()
		.references(() => tenants.id, { onDelete: "cascade" }),
	agencyRef: text("agency_ref").notNull(),
	rentAmountCents: integer("rent_amount_cents").notNull(),
	rentCurrency: text("rent_currency").default("AUD").notNull(),
	frequency: text("frequency").notNull(),
	nextDueAt: timestamp("next_due_at", { withTimezone: true }),
	status: text("status").default("active").notNull(),
});

// Payment schedules table
export const paymentSchedules = pgTable("payment_schedules", {
	id: uuid("id").primaryKey().defaultRandom(),
	leaseId: uuid("lease_id")
		.notNull()
		.references(() => leases.id, { onDelete: "cascade" }),
	frequency: text("frequency").notNull(),
	dayOfWeek: integer("day_of_week"),
	dayOfMonth: integer("day_of_month"),
	startDate: timestamp("start_date", { withTimezone: true }).notNull(),
	endDate: timestamp("end_date", { withTimezone: true }),
	nextRunAt: timestamp("next_run_at", { withTimezone: true }),
	status: text("status").default("active").notNull(),
	failureCount: integer("failure_count").default(0).notNull(),
});

// Payments table
export const payments = pgTable("payments", {
	id: uuid("id").primaryKey().defaultRandom(),
	leaseId: uuid("lease_id")
		.notNull()
		.references(() => leases.id, { onDelete: "cascade" }),
	scheduleId: uuid("schedule_id").references(() => paymentSchedules.id),
	scheduledFor: timestamp("scheduled_for", { withTimezone: true }).notNull(),
	processedAt: timestamp("processed_at", { withTimezone: true }),
	status: text("status").notNull(),
	stripePaymentIntentId: text("stripe_payment_intent_id"),
	stripeTransferId: text("stripe_transfer_id"),
	amountCents: integer("amount_cents").notNull(),
	platformFeeCents: integer("platform_fee_cents").notNull(),
	receiptUrl: text("receipt_url"),
	failureReason: text("failure_reason"),
	retryCount: integer("retry_count").default(0).notNull(),
});

// Trust accounts table
export const trustAccounts = pgTable("trust_accounts", {
	id: uuid("id").primaryKey().defaultRandom(),
	agencyId: uuid("agency_id")
		.notNull()
		.references(() => agencies.id, { onDelete: "cascade" }),
	accountName: text("account_name").notNull(),
	bsb: text("bsb").notNull(),
	accountNumberLast4: text("account_number_last4").notNull(),
	isDefault: boolean("is_default").default(false).notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
	todos: many(todos),
}));

export const todosRelations = relations(todos, ({ one }) => ({
	user: one(users, {
		fields: [todos.userId],
		references: [users.id],
	}),
}));

export const agenciesRelations = relations(agencies, ({ many }) => ({
	properties: many(properties),
	trustAccounts: many(trustAccounts),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
	agency: one(agencies, {
		fields: [properties.agencyId],
		references: [agencies.id],
	}),
	leases: many(leases),
}));

export const tenantsRelations = relations(tenants, ({ many }) => ({
	leases: many(leases),
}));

export const leasesRelations = relations(leases, ({ one, many }) => ({
	property: one(properties, {
		fields: [leases.propertyId],
		references: [properties.id],
	}),
	tenant: one(tenants, {
		fields: [leases.tenantId],
		references: [tenants.id],
	}),
	paymentSchedules: many(paymentSchedules),
	payments: many(payments),
}));

export const paymentSchedulesRelations = relations(
	paymentSchedules,
	({ one, many }) => ({
		lease: one(leases, {
			fields: [paymentSchedules.leaseId],
			references: [leases.id],
		}),
		payments: many(payments),
	}),
);

export const paymentsRelations = relations(payments, ({ one }) => ({
	lease: one(leases, {
		fields: [payments.leaseId],
		references: [leases.id],
	}),
	schedule: one(paymentSchedules, {
		fields: [payments.scheduleId],
		references: [paymentSchedules.id],
	}),
}));

export const trustAccountsRelations = relations(trustAccounts, ({ one }) => ({
	agency: one(agencies, {
		fields: [trustAccounts.agencyId],
		references: [agencies.id],
	}),
}));

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
export type Agency = typeof agencies.$inferSelect;
export type NewAgency = typeof agencies.$inferInsert;
export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;
export type Lease = typeof leases.$inferSelect;
export type NewLease = typeof leases.$inferInsert;
export type PaymentSchedule = typeof paymentSchedules.$inferSelect;
export type NewPaymentSchedule = typeof paymentSchedules.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type TrustAccount = typeof trustAccounts.$inferSelect;
export type NewTrustAccount = typeof trustAccounts.$inferInsert;
