CREATE TABLE audit_log (
    id UUID PRIMARY KEY,
    entity_id UUID NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL, -- e.g., CREATE, UPDATE, DELETE
    changes TEXT, -- JSON representation of changes
    performed_by VARCHAR(100) NOT NULL,
    performed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_entity_id ON audit_log(entity_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
