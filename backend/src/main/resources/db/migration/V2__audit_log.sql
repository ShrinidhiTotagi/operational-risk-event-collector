CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES operational_risk_event(id) ON DELETE SET NULL,
    action_type VARCHAR(20) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    performed_by VARCHAR(100),
    performed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_event_id ON audit_log(event_id);
CREATE INDEX idx_audit_performed_at ON audit_log(performed_at);
