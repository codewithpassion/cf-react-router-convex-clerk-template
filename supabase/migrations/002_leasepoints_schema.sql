-- LeasePoints specific tables as per PRD

-- Tenants table
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legal_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    abn TEXT,
    stripe_customer_id TEXT UNIQUE,
    default_payment_method_id TEXT,
    timezone TEXT DEFAULT 'Australia/Sydney',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agencies table
CREATE TABLE agencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    abn TEXT,
    stripe_account_id TEXT UNIQUE,
    onboarding_status TEXT DEFAULT 'pending',
    payout_schedule TEXT DEFAULT 'weekly',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trust accounts table
CREATE TABLE trust_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    account_name TEXT NOT NULL,
    bsb TEXT NOT NULL,
    account_number_last4 TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE
);

-- Properties table
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    address_line TEXT NOT NULL,
    suburb TEXT NOT NULL,
    state TEXT NOT NULL,
    postcode TEXT NOT NULL,
    external_ref TEXT
);

-- Leases table
CREATE TABLE leases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    agency_ref TEXT NOT NULL,
    rent_amount_cents INTEGER NOT NULL,
    rent_currency TEXT DEFAULT 'AUD',
    frequency TEXT CHECK(frequency IN ('weekly', 'fortnightly', 'monthly')),
    next_due_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active'
);

-- Payment schedules table
CREATE TABLE payment_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lease_id UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
    frequency TEXT NOT NULL,
    day_of_week INTEGER CHECK(day_of_week BETWEEN 0 AND 6),
    day_of_month INTEGER CHECK(day_of_month BETWEEN 1 AND 31),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active',
    failure_count INTEGER DEFAULT 0
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lease_id UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES payment_schedules(id) ON DELETE SET NULL,
    scheduled_for TIMESTAMPTZ NOT NULL,
    processed_at TIMESTAMPTZ,
    status TEXT NOT NULL,
    stripe_payment_intent_id TEXT UNIQUE,
    stripe_transfer_id TEXT,
    amount_cents INTEGER NOT NULL,
    platform_fee_cents INTEGER NOT NULL,
    receipt_url TEXT,
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE INDEX idx_tenants_email ON tenants(email);
CREATE INDEX idx_tenants_stripe_customer ON tenants(stripe_customer_id);

CREATE INDEX idx_agencies_stripe_account ON agencies(stripe_account_id);

CREATE INDEX idx_properties_agency ON properties(agency_id);

CREATE INDEX idx_leases_property ON leases(property_id);
CREATE INDEX idx_leases_tenant ON leases(tenant_id);
CREATE INDEX idx_leases_status ON leases(status);

CREATE INDEX idx_payment_schedules_lease ON payment_schedules(lease_id);
CREATE INDEX idx_payment_schedules_next_run ON payment_schedules(next_run_at);
CREATE INDEX idx_payment_schedules_status ON payment_schedules(status);

CREATE INDEX idx_payments_lease ON payments(lease_id);
CREATE INDEX idx_payments_schedule ON payments(schedule_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_scheduled_for ON payments(scheduled_for);
CREATE INDEX idx_payments_stripe_intent ON payments(stripe_payment_intent_id);

-- Triggers to update updated_at
CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security for LeasePoints tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (to be refined based on business logic)
-- Tenants can see their own data
CREATE POLICY "Tenants can view own data" ON tenants
    FOR SELECT USING (auth.jwt() ->> 'tenant_id' = id::text);

-- Agencies can see their own data
CREATE POLICY "Agencies can view own data" ON agencies
    FOR SELECT USING (auth.jwt() ->> 'agency_id' = id::text);

-- Admins can see all data
CREATE POLICY "Admins can view all tenants" ON tenants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE clerk_id = auth.jwt() ->> 'sub'
            AND ('admin' = ANY(roles) OR 'superadmin' = ANY(roles))
        )
    );

CREATE POLICY "Admins can view all agencies" ON agencies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE clerk_id = auth.jwt() ->> 'sub'
            AND ('admin' = ANY(roles) OR 'superadmin' = ANY(roles))
        )
    );

CREATE POLICY "Admins can view all properties" ON properties
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE clerk_id = auth.jwt() ->> 'sub'
            AND ('admin' = ANY(roles) OR 'superadmin' = ANY(roles))
        )
    );

CREATE POLICY "Admins can view all leases" ON leases
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE clerk_id = auth.jwt() ->> 'sub'
            AND ('admin' = ANY(roles) OR 'superadmin' = ANY(roles))
        )
    );

CREATE POLICY "Admins can view all payment schedules" ON payment_schedules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE clerk_id = auth.jwt() ->> 'sub'
            AND ('admin' = ANY(roles) OR 'superadmin' = ANY(roles))
        )
    );

CREATE POLICY "Admins can view all payments" ON payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE clerk_id = auth.jwt() ->> 'sub'
            AND ('admin' = ANY(roles) OR 'superadmin' = ANY(roles))
        )
    );

CREATE POLICY "Admins can view all trust accounts" ON trust_accounts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE clerk_id = auth.jwt() ->> 'sub'
            AND ('admin' = ANY(roles) OR 'superadmin' = ANY(roles))
        )
    );