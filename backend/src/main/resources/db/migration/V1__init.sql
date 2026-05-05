CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

INSERT INTO roles (name) VALUES ('ROLE_ADMIN'), ('ROLE_RISK_OFFICER'), ('ROLE_VIEWER');

CREATE TABLE operational_risk_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_code VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description VARCHAR,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    category VARCHAR(50) NOT NULL,
    sub_category VARCHAR(100),
    business_unit VARCHAR(100),
    department VARCHAR(100),
    location VARCHAR(100),
    impact_type VARCHAR(50),
    likelihood SMALLINT CHECK (likelihood BETWEEN 1 AND 5),
    impact SMALLINT CHECK (impact BETWEEN 1 AND 5),
    inherent_risk_score SMALLINT GENERATED ALWAYS AS (likelihood * impact) STORED,
    residual_risk_score SMALLINT,
    loss_amount NUMERIC(18,2),
    currency VARCHAR(3) DEFAULT 'USD',
    incident_date DATE,
    discovery_date DATE,
    closure_date DATE,
    root_cause VARCHAR,
    control_failures VARCHAR,
    kri VARCHAR,
    action_plan VARCHAR,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

CREATE INDEX idx_ore_status ON operational_risk_event(status);
CREATE INDEX idx_ore_category ON operational_risk_event(category);
CREATE INDEX idx_ore_incident_date ON operational_risk_event(incident_date);
CREATE INDEX idx_ore_deleted ON operational_risk_event(deleted);
CREATE INDEX idx_ore_reference_code ON operational_risk_event(reference_code);
