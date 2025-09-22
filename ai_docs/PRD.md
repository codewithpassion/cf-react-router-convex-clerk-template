# LeasePoints MVP - Product Requirements Prompt (PRP)

## Executive Summary

LeasePoints is a commercial lease payment intermediary platform that enables businesses to pay rent via credit cards (earning rewards) while ensuring landlords receive seamless trust account deposits with complete reconciliation data. The platform charges a 3% processing fee (tax-deductible for tenants) and handles all payment routing, scheduling, and compliance through Stripe Connect Custom accounts.

## FEATURE: Commercial Lease Payment Platform MVP

Build a production-ready commercial lease payment platform using Cloudflare Workers, TypeScript, Hono API framework, React frontend, and Stripe Connect for payment processing. The system must handle tenant payment scheduling, agency/landlord onboarding with KYC/KYB, automated payment execution with retry logic, trust account reconciliation with rich metadata, and comprehensive reporting capabilities.

### Core Business Requirements

1. **Tenant Payment System**
   - Save payment methods (credit cards, especially Amex) via Stripe Elements
   - Schedule recurring payments (weekly/fortnightly/monthly)
   - Calculate and display 3% platform fee transparently
   - Generate IRS-compliant receipts for all transactions
   - Support off-session billing for scheduled payments

2. **Agency/Landlord Management**
   - Stripe Connect Custom account creation with hosted onboarding
   - Multiple trust account support per agency
   - Configurable payout schedules (default weekly)
   - Rich transaction metadata for reconciliation
   - Export capabilities for property management systems

3. **Payment Orchestration**
   - Destination charges routing funds directly to agencies
   - Application fee collection (3% platform fee)
   - Smart retry logic for failed payments (0hr, 24hr, 72hr)
   - Idempotent payment processing to prevent duplicates
   - Comprehensive webhook handling for all payment states

4. **Reconciliation & Reporting**
   - Daily CSV/Excel exports with full transaction details
   - MRI/Yardi/AppFolio compatible data formats
   - Rich metadata on all charges and transfers
   - Statement descriptor management for bank reconciliation
   - Real-time dashboard with payment status tracking

## EXAMPLES

### Stripe Connect Integration
```typescript
// examples/stripe/connect-onboarding.ts
import Stripe from 'stripe';

export async function createConnectedAccount(
  stripe: Stripe,
  agencyData: {
    email: string;
    businessName: string;
    businessType: 'company' | 'individual';
    country: string;
  }
) {
  const account = await stripe.accounts.create({
    type: 'custom',
    country: agencyData.country || 'AU',
    email: agencyData.email,
    business_type: agencyData.businessType,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_profile: {
      name: agencyData.businessName,
      mcc: '6513', // Real Estate Agents and Managers
    },
    settings: {
      payouts: {
        schedule: {
          interval: 'weekly',
          weekly_anchor: 'friday',
        },
      },
    },
    metadata: {
      platform: 'LeasePoints',
      onboarding_version: '1.0',
    },
  });

  // Generate hosted onboarding link
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: 'https://app.leasepoints.com/agency/onboarding/refresh',
    return_url: 'https://app.leasepoints.com/agency/onboarding/complete',
    type: 'account_onboarding',
  });

  return { account, accountLink };
}
```

### Destination Charge Implementation
```typescript
// examples/stripe/destination-charge.ts
export async function createLeasePayment(
  stripe: Stripe,
  paymentData: {
    tenantId: string;
    leaseId: string;
    agencyStripeAccountId: string;
    baseRentCents: number;
    paymentMethodId: string;
    metadata: LeasePaymentMetadata;
  }
) {
  const platformFeeCents = Math.round(paymentData.baseRentCents * 0.03);
  const totalChargeCents = paymentData.baseRentCents + platformFeeCents;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalChargeCents,
    currency: 'aud',
    customer: paymentData.tenantId,
    payment_method: paymentData.paymentMethodId,
    off_session: true,
    confirm: true,
    
    // Destination charge configuration
    transfer_data: {
      destination: paymentData.agencyStripeAccountId,
    },
    
    // Platform fee
    application_fee_amount: platformFeeCents,
    
    // Rich metadata for reconciliation
    metadata: {
      tenant_id: paymentData.metadata.tenantId,
      tenant_name: paymentData.metadata.tenantName,
      tenant_abn: paymentData.metadata.tenantAbn,
      lease_id: paymentData.metadata.leaseId,
      agency_id: paymentData.metadata.agencyId,
      agency_ref: paymentData.metadata.agencyRef,
      property_addr: paymentData.metadata.propertyAddress,
      trust_acct_id: paymentData.metadata.trustAccountId,
      period_start: paymentData.metadata.periodStart,
      period_end: paymentData.metadata.periodEnd,
      invoice_no: paymentData.metadata.invoiceNumber,
      base_rent_cents: paymentData.baseRentCents.toString(),
      platform_fee_cents: platformFeeCents.toString(),
      total_charged_cents: totalChargeCents.toString(),
    },
    
    // Statement descriptor for bank reconciliation
    statement_descriptor_suffix: generateStatementDescriptor(paymentData.metadata),
    
    // Enable future off-session usage
    setup_future_usage: 'off_session',
  });

  return paymentIntent;
}

function generateStatementDescriptor(metadata: LeasePaymentMetadata): string {
  // Max 22 chars for suffix
  const property = metadata.propertyAddress.split(' ')[0].substring(0, 10);
  const month = metadata.periodStart.substring(5, 7);
  const year = metadata.periodStart.substring(2, 4);
  return `LP ${property} ${month}${year}`.toUpperCase().substring(0, 22);
}
```

### Payment Scheduler
```typescript
// examples/api/payment-scheduler.ts
import { Hono } from 'hono';
import { z } from 'zod';

const scheduleSchema = z.object({
  leaseId: z.string(),
  frequency: z.enum(['weekly', 'fortnightly', 'monthly']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  dayOfWeek: z.number().min(0).max(6).optional(),
  dayOfMonth: z.number().min(1).max(31).optional(),
});

export const schedulerRouter = new Hono()
  .post('/schedules', async (c) => {
    const data = scheduleSchema.parse(await c.req.json());

    // Store schedule in Supabase using Drizzle ORM
    const schedule = await db.insert(paymentSchedules).values({
      leaseId: data.leaseId,
      frequency: data.frequency,
      startDate: data.startDate,
      endDate: data.endDate || null,
      dayOfWeek: data.dayOfWeek || null,
      dayOfMonth: data.dayOfMonth || null,
      status: 'active',
      nextRunAt: calculateNextRun(data)
    }).returning({ id: paymentSchedules.id });

    // Queue first payment if due immediately
    if (shouldRunToday(data)) {
      await c.env.PAYMENT_QUEUE.send({
        type: 'scheduled_payment',
        scheduleId: schedule[0].id,
        leaseId: data.leaseId,
      });
    }

    return c.json({ success: true, scheduleId: schedule[0].id });
  });

function calculateNextRun(schedule: unknown): string {
  const now = new Date();
  const start = new Date(schedule.startDate);
  
  if (start > now) return schedule.startDate;
  
  // Calculate next run based on frequency
  switch (schedule.frequency) {
    case 'weekly':
      // Find next occurrence of dayOfWeek
      break;
    case 'fortnightly':
      // Calculate 14-day intervals from start
      break;
    case 'monthly':
      // Find next occurrence of dayOfMonth
      break;
  }
  
  return new Date().toISOString();
}
```

### Database Schema
```sql
-- examples/database/schema.sql
-- PostgreSQL Schema for LeasePoints MVP
-- This schema will be defined using Drizzle ORM schema files
-- See /db/schema.ts for the Drizzle schema definitions

-- Raw SQL for reference (actual implementation uses Drizzle schema)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  abn VARCHAR(20),
  stripe_customer_id VARCHAR(255) UNIQUE,
  default_payment_method_id VARCHAR(255),
  timezone VARCHAR(50) DEFAULT 'Australia/Sydney',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  abn VARCHAR(20),
  stripe_account_id VARCHAR(255) UNIQUE,
  onboarding_status VARCHAR(50) DEFAULT 'pending',
  payout_schedule VARCHAR(50) DEFAULT 'weekly',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE trust_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  bsb VARCHAR(10) NOT NULL,
  account_number_last4 VARCHAR(4) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE
);

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL,
  address_line VARCHAR(255) NOT NULL,
  suburb VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  postcode VARCHAR(10) NOT NULL,
  external_ref VARCHAR(100),
  FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE
);

CREATE TABLE leases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  agency_ref VARCHAR(100) NOT NULL,
  rent_amount_cents BIGINT NOT NULL,
  rent_currency VARCHAR(3) DEFAULT 'AUD',
  frequency VARCHAR(20) CHECK(frequency IN ('weekly', 'fortnightly', 'monthly')),
  next_due_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'active',
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE payment_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id UUID NOT NULL,
  frequency VARCHAR(20) NOT NULL,
  day_of_week INTEGER CHECK(day_of_week >= 0 AND day_of_week <= 6),
  day_of_month INTEGER CHECK(day_of_month >= 1 AND day_of_month <= 31),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'active',
  failure_count INTEGER DEFAULT 0,
  FOREIGN KEY (lease_id) REFERENCES leases(id) ON DELETE CASCADE
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id UUID NOT NULL,
  schedule_id UUID,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) NOT NULL,
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  stripe_transfer_id VARCHAR(255),
  amount_cents BIGINT NOT NULL,
  platform_fee_cents BIGINT NOT NULL,
  receipt_url VARCHAR(500),
  failure_reason TEXT,
  retry_count INTEGER DEFAULT 0,
  FOREIGN KEY (lease_id) REFERENCES leases(id) ON DELETE CASCADE,
  FOREIGN KEY (schedule_id) REFERENCES payment_schedules(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX idx_payments_lease_id ON payments(lease_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_scheduled_for ON payments(scheduled_for);
CREATE INDEX idx_schedules_next_run ON payment_schedules(next_run_at);
CREATE INDEX idx_schedules_status ON payment_schedules(status);

-- Add RLS policies for security
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

```typescript
// Example Drizzle schema structure for /db/schema.ts:
import { pgTable, uuid, varchar, timestamp, boolean, bigint, integer } from 'drizzle-orm/pg-core';

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  legalName: varchar('legal_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  abn: varchar('abn', { length: 20 }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }).unique(),
  defaultPaymentMethodId: varchar('default_payment_method_id', { length: 255 }),
  timezone: varchar('timezone', { length: 50 }).default('Australia/Sydney'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const agencies = pgTable('agencies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  abn: varchar('abn', { length: 20 }),
  stripeAccountId: varchar('stripe_account_id', { length: 255 }).unique(),
  onboardingStatus: varchar('onboarding_status', { length: 50 }).default('pending'),
  payoutSchedule: varchar('payout_schedule', { length: 50 }).default('weekly'),
  createdAt: timestamp('created_at').defaultNow()
});

export const paymentSchedules = pgTable('payment_schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  leaseId: uuid('lease_id').notNull().references(() => leases.id, { onDelete: 'cascade' }),
  frequency: varchar('frequency', { length: 20 }).notNull(),
  dayOfWeek: integer('day_of_week'),
  dayOfMonth: integer('day_of_month'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  nextRunAt: timestamp('next_run_at'),
  status: varchar('status', { length: 50 }).default('active'),
  failureCount: integer('failure_count').default(0)
});

// Database connection using Drizzle
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client);
```
```

## DOCUMENTATION

### Stripe Connect Documentation
- **Connect Custom Accounts**: https://stripe.com/docs/connect/custom-accounts
- **Hosted Onboarding**: https://stripe.com/docs/connect/onboarding/hosted
- **Destination Charges**: https://stripe.com/docs/connect/destination-charges
- **Payment Intents API**: https://stripe.com/docs/api/payment_intents
- **SetupIntents for Saved Cards**: https://stripe.com/docs/api/setup_intents
- **Off-Session Payments**: https://stripe.com/docs/payments/save-during-payment
- **Idempotency**: https://stripe.com/docs/api/idempotent-requests
- **Webhook Security**: https://stripe.com/docs/webhooks/signatures

### Infrastructure Documentation
- **Cloudflare Workers**: https://developers.cloudflare.com/workers/
- **Supabase**: https://supabase.com/docs
- **Supabase Auth**: https://supabase.com/docs/guides/auth
- **Supabase RLS**: https://supabase.com/docs/guides/auth/row-level-security
- **Durable Objects**: https://developers.cloudflare.com/durable-objects/
- **Queues**: https://developers.cloudflare.com/queues/
- **Cron Triggers**: https://developers.cloudflare.com/workers/platform/triggers/cron-triggers/
- **KV Storage**: https://developers.cloudflare.com/workers/runtime-apis/kv/
- **R2 Storage**: https://developers.cloudflare.com/r2/

### Framework Documentation
- **Hono**: https://hono.dev/
- **React Query**: https://tanstack.com/query/latest
- **Zod Validation**: https://zod.dev/
- **Stripe React**: https://stripe.com/docs/stripe-js/react
- **Drizzle ORM**: https://orm.drizzle.team/

## TECHNICAL ARCHITECTURE

### System Components

```typescript
interface SystemArchitecture {
  frontend: {
    tenantPortal: {
      framework: 'React 18 + TypeScript';
      routing: 'React Router v6';
      state: '@tanstack/react-query';
      payments: '@stripe/react-stripe-js';
      styling: 'Tailwind CSS';
    };
    agencyPortal: {
      framework: 'React 18 + TypeScript';
      features: ['onboarding', 'reconciliation', 'exports'];
    };
    adminDashboard: {
      framework: 'React 18 + TypeScript';
      monitoring: 'Real-time metrics and alerts';
    };
  };

  backend: {
    api: {
      framework: 'Hono on Cloudflare Workers';
      authentication: 'Clerk authentication with JWT';
      validation: 'Zod schemas';
      rateLimit: 'Cloudflare Rate Limiting';
    };
    paymentProcessor: {
      runtime: 'Durable Objects';
      scheduling: 'Cron Triggers';
      queue: 'Cloudflare Queues';
      retries: 'Exponential backoff';
    };
    webhookHandler: {
      verification: 'Stripe signature validation';
      idempotency: 'Database deduplication';
      processing: 'Queue-based async';
    };
  };

  data: {
    primary: 'Supabase (PostgreSQL database)';
    orm: 'Drizzle ORM for type-safe queries';
    cache: 'Cloudflare KV';
    files: 'R2 Storage (exports/reports)';
    search: 'PostgreSQL with indexed queries';
  };

  integrations: {
    payments: 'Stripe Connect Custom';
    email: 'SendGrid/Resend';
    monitoring: 'Sentry + Cloudflare Analytics';
    exports: 'CSV/Excel generation';
  };
}
```

### API Structure

```typescript
// API Route Structure
const apiRoutes = {
  // Tenant endpoints
  '/api/v1/tenants': {
    POST: 'Create tenant account',
    GET: 'Get tenant profile',
    PUT: 'Update tenant details',
  },
  '/api/v1/tenants/payment-methods': {
    POST: 'Save payment method',
    GET: 'List payment methods',
    DELETE: 'Remove payment method',
  },
  '/api/v1/tenants/schedules': {
    POST: 'Create payment schedule',
    GET: 'List schedules',
    PUT: 'Update schedule',
    DELETE: 'Cancel schedule',
  },
  
  // Agency endpoints
  '/api/v1/agencies': {
    POST: 'Create agency account',
    GET: 'Get agency profile',
  },
  '/api/v1/agencies/onboarding': {
    POST: 'Start Stripe onboarding',
    GET: 'Check onboarding status',
  },
  '/api/v1/agencies/trust-accounts': {
    POST: 'Add trust account',
    GET: 'List trust accounts',
  },
  '/api/v1/agencies/exports': {
    GET: 'Generate reconciliation export',
    POST: 'Schedule automated exports',
  },
  
  // Payment endpoints
  '/api/v1/payments': {
    POST: 'Create one-off payment',
    GET: 'List payments',
  },
  '/api/v1/payments/retry': {
    POST: 'Retry failed payment',
  },
  
  // Webhook endpoints
  '/api/v1/webhooks/stripe': {
    POST: 'Handle Stripe webhooks',
  },
  
  // Admin endpoints
  '/api/v1/admin/dashboard': {
    GET: 'Get dashboard metrics',
  },
  '/api/v1/admin/payments': {
    GET: 'Search all payments',
  },
};
```

### Payment Processing Flow

```typescript
interface PaymentFlow {
  scheduling: {
    trigger: 'Cron job runs every 5 minutes';
    query: 'Find schedules with next_run_at <= NOW';
    queue: 'Send to payment queue with lease details';
  };
  
  processing: {
    validation: 'Check tenant has valid payment method';
    calculation: 'Add 3% platform fee to base rent';
    stripe: 'Create PaymentIntent with destination charge';
    idempotency: 'Use lease_id + period as idempotency key';
  };
  
  success: {
    database: 'Record payment with all metadata';
    receipt: 'Generate and email receipt';
    schedule: 'Update next_run_at for schedule';
    reconciliation: 'Add to export queue';
  };
  
  failure: {
    immediate: 'Log failure reason';
    retry: 'Schedule retry based on failure type';
    notification: 'Email tenant with update card link';
    escalation: 'After 3 failures, pause schedule';
  };
}
```

### Reconciliation Metadata

```typescript
interface ReconciliationMetadata {
  // Required fields for agency reconciliation
  tenant_id: string;
  tenant_name: string;
  tenant_abn?: string;
  lease_id: string;
  agency_id: string;
  agency_ref: string; // Their internal reference
  property_addr: string;
  trust_acct_id: string;
  period_start: string; // YYYY-MM-DD
  period_end: string;
  due_rule: string; // e.g., "MONTHLY_DOM_1"
  invoice_no: string; // Unique invoice number
  base_rent_cents: number;
  platform_fee_cents: number;
  total_charged_cents: number;
  schedule_id: string;
  run_sequence: string; // For idempotency
}

// Export format for MRI/Yardi
interface ExportRow {
  date: string;
  time: string;
  tenant_name: string;
  tenant_id: string;
  lease_id: string;
  agency_ref: string;
  property_addr: string;
  period_start: string;
  period_end: string;
  amount_gross: number;
  platform_fee: number;
  amount_net: number;
  card_last4: string;
  payment_intent_id: string;
  transfer_id: string;
  payout_id: string;
}
```

## OTHER CONSIDERATIONS

### Integration Considerations

1. **Cloudflare Workers Limits**
   - 128MB max memory per worker
   - Solution: Stream large CSV exports to R2
   - Implementation: Use TransformStream for processing

2. **Database Connection Pooling**
   - Supabase connection limits
   - Solution: Use Drizzle with connection pooling
   - Implementation: Configure postgres.js client properly

3. **Authentication Integration**
   - Clerk + Supabase RLS integration
   - Solution: Pass Clerk user ID to Supabase RLS policies
   - Implementation: Custom RLS policies based on Clerk user metadata

4. **Real-time Features**
   - Supabase real-time subscriptions
   - Solution: Use Supabase subscriptions for live updates
   - Implementation: Subscribe to payment status changes

### Stripe Connect Considerations

1. **KYC/KYB Requirements**
   - Agencies must complete identity verification
   - Solution: Use Stripe's hosted onboarding flow
   - Handle restricted/disabled accounts gracefully

2. **Payout Timing**
   - Standard payout delay: 2-7 days
   - Solution: Clear communication about fund availability
   - Offer configurable payout schedules

3. **International Payments**
   - Currency conversion fees may apply
   - Solution: Support multi-currency (start with AUD)
   - Clear fee disclosure

4. **Dispute Handling**
   - Platform holds dispute liability with destination charges
   - Solution: Comprehensive dispute response system
   - Maintain transaction evidence

### PostgreSQL & Drizzle Considerations

1. **Type Safety**
   - Drizzle provides full TypeScript type safety
   - Solution: Use generated types for all database operations
   - Implementation: `drizzle-kit generate` for schema changes

2. **Migration Management**
   - Automatic migration generation
   - Solution: Use Drizzle Kit for schema migrations
   - Implementation: Version-controlled migration files

3. **Connection Pooling**
   - PostgreSQL connection limits with Supabase
   - Solution: Configure postgres.js with proper pooling
   - Implementation: Shared connection instance across workers

4. **Query Performance**
   - Complex queries with joins
   - Solution: Use Drizzle's query builder for optimized SQL
   - Implementation: Proper indexing and query optimization

### Australian Market Specifics

1. **Trust Account Regulations**
   - Strict requirements for handling client funds
   - Solution: Direct deposit to agency trust accounts
   - Maintain complete audit trail

2. **GST Considerations**
   - 10% GST may apply to platform fee
   - Solution: Configurable GST handling
   - Tax-compliant invoicing

3. **Banking Integration**
   - BSB and account number validation
   - Solution: Integrate Australian bank account validation
   - Support for major Australian banks

### Error Handling Patterns

```typescript
class PaymentError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean,
    public userMessage: string
  ) {
    super(message);
  }
}

const errorHandling = {
  paymentFailures: {
    insufficient_funds: {
      retryable: true,
      retryDelay: 86400000, // 24 hours
      userMessage: 'Payment failed due to insufficient funds. We will retry tomorrow.',
    },
    card_expired: {
      retryable: false,
      userMessage: 'Your card has expired. Please update your payment method.',
      action: 'UPDATE_PAYMENT_METHOD',
    },
    processing_error: {
      retryable: true,
      retryDelay: 3600000, // 1 hour
      userMessage: 'Temporary processing issue. We will retry shortly.',
    },
  },
  
  webhookFailures: {
    signature_invalid: {
      log: 'error',
      response: 400,
      message: 'Invalid webhook signature',
    },
    duplicate_event: {
      log: 'info',
      response: 200,
      message: 'Duplicate event ignored',
    },
  },
};
```

### Performance Requirements

1. **Response Times**
   - API endpoints: < 200ms p95
   - Dashboard load: < 2s initial, < 500ms subsequent
   - Payment processing: < 5s end-to-end

2. **Throughput**
   - Support 1000 concurrent tenants
   - Process 100 payments/minute
   - Handle 10,000 webhooks/hour

3. **Availability**
   - 99.9% uptime SLA
   - Automatic failover for critical paths
   - Graceful degradation for non-critical features

4. **Data Consistency**
   - Zero payment duplication
   - Accurate reconciliation within 1 minute
   - Idempotent operations throughout

### Monitoring & Observability

```typescript
interface MonitoringRequirements {
  metrics: {
    business: [
      'payments.processed.count',
      'payments.failed.count',
      'payments.retry.success_rate',
      'platform_fee.collected.amount',
      'agencies.onboarded.count',
      'tenants.active.count',
    ];
    
    technical: [
      'api.latency.p95',
      'api.errors.rate',
      'stripe.api.latency',
      'database.query.time',
      'queue.depth',
      'worker.errors.rate',
    ];
  };
  
  alerts: {
    critical: [
      'Payment processing failure rate > 5%',
      'Stripe webhook failures > 10/min',
      'Database connection errors',
      'Queue processing stopped',
    ];
    
    warning: [
      'API latency > 1s',
      'Retry queue depth > 100',
      'Failed payment retry rate > 20%',
      'Export generation failure',
    ];
  };
}
```

### Testing Requirements

```typescript
interface TestingStrategy {
  unit: {
    coverage: '> 80%';
    framework: 'Vitest';
    focus: ['Business logic', 'Payment calculations', 'Scheduling logic'];
  };
  
  integration: {
    coverage: '> 60%';
    framework: 'Vitest + MSW';
    focus: ['API endpoints', 'Stripe integration', 'Database operations'];
  };
  
  e2e: {
    coverage: 'Critical paths';
    framework: 'Playwright';
    scenarios: [
      'Tenant onboarding and first payment',
      'Agency onboarding and trust account setup',
      'Payment failure and retry flow',
      'Reconciliation export generation',
    ];
  };
}
```

## SUCCESS CRITERIA

### MVP Launch Requirements

1. **Functional Requirements**
   - 10+ agencies successfully onboarded via Stripe Connect
   - 50+ active leases with payment schedules
   - 95% payment success rate (excluding insufficient funds)
   - 100% successful reconciliation via CSV export
   - < 5 minute delay for scheduled payment execution
   - Automatic retry for failed payments working
   - IRS-compliant receipts generated for all payments

2. **Performance Requirements**
   - API response time < 500ms (p95)
   - Dashboard load time < 3s
   - Support 100 concurrent users
   - Process 50 payments per minute
   - Zero duplicate payments
   - 99.9% uptime during business hours

3. **Integration Requirements**
   - Stripe Connect Custom fully integrated
   - CSV export compatible with MRI format
   - Email notifications working reliably
   - Webhook processing with < 1s latency
   - Rich metadata on all transactions

4. **Business Metrics**
   - Platform fee collection working (3% per transaction)
   - Agencies receiving payouts on schedule
   - Tenants earning reward points confirmed
   - Tax-deductible receipts accepted by accountants

### Validation Tests

```bash
# Core functionality tests
bun test -- --grep "payment.processing"
bun test -- --grep "schedule.execution"
bun test -- --grep "stripe.integration"
bun test -- --grep "reconciliation.export"

# Integration tests
bun test:integration -- --grep "tenant.onboarding"
bun test:integration -- --grep "agency.payout"

# Performance tests
bun test:performance -- --scenario=payment-load
bun test:performance -- --scenario=api-stress

# Security tests
bun test:security -- --scan=api
bun test:security -- --scan=dependencies
```

## Implementation Priority

### Phase 1: Foundation (Week 1-2)
1. Database schema and D1 setup
2. Stripe Connect integration
3. Basic API structure with Hono
4. Authentication system
5. Tenant and Agency models

### Phase 2: Payment Core (Week 3-4)
1. Payment method management
2. Payment intent creation
3. Destination charges
4. Webhook handling
5. Receipt generation

### Phase 3: Scheduling (Week 5-6)
1. Payment schedule CRUD
2. Cron job setup
3. Queue processing
4. Retry logic
5. Failure notifications

### Phase 4: Reconciliation (Week 7)
1. Metadata enrichment
2. CSV export generation
3. Daily export automation
4. Agency portal basics
5. Transaction search

### Phase 5: Polish & Launch (Week 8)
1. Frontend completion
2. Admin dashboard
3. Performance optimization
4. Security hardening
5. Production deployment

---

This PRP provides comprehensive implementation specifications for the LeasePoints MVP, with particular focus on Stripe Connect integration, payment scheduling, reconciliation requirements, and production-ready error handling.
