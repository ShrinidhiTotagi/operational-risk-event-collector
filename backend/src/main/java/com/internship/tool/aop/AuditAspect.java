package com.internship.tool.aop;

import com.internship.tool.entity.AuditLog;
import com.internship.tool.entity.RiskEvent;
import com.internship.tool.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.UUID;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditAspect {

    private final AuditLogRepository auditLogRepository;

    @AfterReturning(value = "@annotation(com.internship.tool.aop.Auditable)", returning = "result")
    public void logAuditActivity(JoinPoint joinPoint, Object result) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        Auditable auditable = method.getAnnotation(Auditable.class);
        
        String action = auditable.action();
        
        UUID entityId = null;
        String entityName = "RiskEvent";
        String changes = "No changes recorded";
        
        // Extract ID from result if it's a RiskEvent (for CREATE/UPDATE)
        if (result instanceof RiskEvent) {
            RiskEvent event = (RiskEvent) result;
            entityId = event.getId();
            changes = String.format("Title: %s, Status: %s, Severity: %s", 
                                    event.getTitle(), event.getStatus(), event.getSeverity());
        } else if ("DELETE".equals(action)) {
            // For delete, the ID is usually the first argument
            Object[] args = joinPoint.getArgs();
            if (args.length > 0 && args[0] instanceof UUID) {
                entityId = (UUID) args[0];
                changes = "Entity marked as deleted";
            }
        }
        
        if (entityId != null) {
            // In a real app, get this from SecurityContextHolder
            String performedBy = "system_user"; 
            
            AuditLog auditLog = AuditLog.builder()
                    .entityId(entityId)
                    .entityName(entityName)
                    .action(action)
                    .changes(changes)
                    .performedBy(performedBy)
                    .build();
                    
            auditLogRepository.save(auditLog);
            log.info("Audit log saved for {} on {} by {}", action, entityId, performedBy);
        }
    }
}
