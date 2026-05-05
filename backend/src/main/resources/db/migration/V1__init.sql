CREATE TABLE risk_event (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g., OPEN, IN_PROGRESS, RESOLVED, CLOSED
    severity VARCHAR(50) NOT NULL, -- e.g., LOW, MEDIUM, HIGH, CRITICAL
    category VARCHAR(100) NOT NULL, -- e.g., IT, HR, FINANCE, COMPLIANCE
    occurred_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    ai_score INTEGER,
    ai_analysis TEXT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_risk_event_status ON risk_event(status);
CREATE INDEX idx_risk_event_severity ON risk_event(severity);
CREATE INDEX idx_risk_event_occurred_at ON risk_event(occurred_at);
CREATE INDEX idx_risk_event_is_deleted ON risk_event(is_deleted);
