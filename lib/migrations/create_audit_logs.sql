-- Audit Logs Table Migration
-- Run this SQL in your database to create the audit_logs table

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(50) NOT NULL,           -- approve, reject, create_officer, etc.
    actor_type VARCHAR(20) NOT NULL,       -- admin, officer
    actor_id INTEGER NOT NULL,             -- ID of user who performed action
    actor_name VARCHAR(255),               -- Name for display purposes
    target_type VARCHAR(50) NOT NULL,      -- clearance, student, officer, etc.
    target_id VARCHAR(100),                -- ID of affected entity
    target_name VARCHAR(255),              -- Name/identifier of target
    details JSONB,                         -- Additional context as JSON
    ip_address VARCHAR(45),                -- IPv4 or IPv6 address
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_type ON audit_logs(actor_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_type ON audit_logs(target_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Composite index for filtered queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_type, actor_id);
