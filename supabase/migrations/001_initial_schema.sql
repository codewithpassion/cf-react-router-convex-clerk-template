-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (synced from Clerk)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    image_url TEXT,
    roles TEXT[] DEFAULT ARRAY['user'],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on clerk_id for fast lookups
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);

-- Todos table
CREATE TABLE todos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for todos
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_user_completed ON todos(user_id, completed, created_at);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Users can only see their own record
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.jwt() ->> 'sub' = clerk_id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.jwt() ->> 'sub' = clerk_id);

-- Users can only access their own todos
CREATE POLICY "Users can view own todos" ON todos
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can insert own todos" ON todos
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can update own todos" ON todos
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can delete own todos" ON todos
    FOR DELETE USING (
        user_id IN (
            SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
        )
    );

-- Admin policies (users with admin role can see everything)
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE clerk_id = auth.jwt() ->> 'sub'
            AND ('admin' = ANY(roles) OR 'superadmin' = ANY(roles))
        )
    );

CREATE POLICY "Admins can view all todos" ON todos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE clerk_id = auth.jwt() ->> 'sub'
            AND ('admin' = ANY(roles) OR 'superadmin' = ANY(roles))
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();