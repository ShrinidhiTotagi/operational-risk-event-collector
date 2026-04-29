package com.internship.tool.service;

import com.internship.tool.entity.OperationalRiskEvent;
import com.internship.tool.repository.OperationalRiskEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ScheduledTaskService {

    private static final Logger log = LoggerFactory.getLogger(ScheduledTaskService.class);

    private final OperationalRiskEventRepository repository;
    private final EmailService emailService;

    public ScheduledTaskService(OperationalRiskEventRepository repository, EmailService emailService) {
        this.repository = repository;
        this.emailService = emailService;
    }

    @Scheduled(cron = "0 0 8 * * *")
    public void sendOverdueReminders() {
        LocalDate threshold = LocalDate.now().minusDays(30);
        List<OperationalRiskEvent> overdue = repository.findOverdueEvents(threshold);
        if (overdue.isEmpty()) return;
        log.info("Found {} overdue events", overdue.size());
        for (OperationalRiskEvent e : overdue) {
            String owner = e.getCreatedBy() != null ? e.getCreatedBy() : "risk-team";
            emailService.send(
                    owner + "@tool66.local",
                    "[Tool-66] Overdue Risk Event: " + e.getReferenceCode(),
                    "Event '" + e.getTitle() + "' (" + e.getReferenceCode() + ") has been open since "
                            + e.getIncidentDate() + " and requires attention."
            );
        }
    }
}
