package com.internship.tool.service;

import com.internship.tool.entity.AuditLog;
import com.internship.tool.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(UUID eventId, String actionType, String oldValue, String newValue, String performedBy) {
        AuditLog entry = new AuditLog();
        entry.setEventId(eventId);
        entry.setActionType(actionType);
        entry.setOldValue(oldValue);
        entry.setNewValue(newValue);
        entry.setPerformedBy(performedBy);
        auditLogRepository.save(entry);
    }
}
