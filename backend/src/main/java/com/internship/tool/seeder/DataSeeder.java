package com.internship.tool.seeder;

import com.internship.tool.entity.RiskEvent;
import com.internship.tool.repository.RiskEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final RiskEventRepository riskEventRepository;

    @Override
    public void run(String... args) {
        if (riskEventRepository.count() == 0) {
            log.info("Seeding initial data...");
            seedData();
            log.info("Data seeding completed.");
        }
    }

    private void seedData() {
        List<RiskEvent> events = new ArrayList<>();
        String[] statuses = {"OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"};
        String[] severities = {"LOW", "MEDIUM", "HIGH", "CRITICAL"};
        String[] categories = {"IT", "HR", "FINANCE", "COMPLIANCE", "OPERATIONS"};
        
        Random random = new Random();

        for (int i = 1; i <= 15; i++) {
            events.add(RiskEvent.builder()
                    .title("Sample Risk Event " + i)
                    .description("This is a detailed description for risk event " + i + ". It describes what happened, who was involved, and the potential impact.")
                    .status(statuses[random.nextInt(statuses.length)])
                    .severity(severities[random.nextInt(severities.length)])
                    .category(categories[random.nextInt(categories.length)])
                    .occurredAt(LocalDateTime.now().minusDays(random.nextInt(30)))
                    .createdBy("system_seeder")
                    .aiScore(random.nextInt(100))
                    .aiAnalysis("AI suggests this event has typical characteristics of " + categories[random.nextInt(categories.length)] + " issues.")
                    .isDeleted(false)
                    .build());
        }

        riskEventRepository.saveAll(events);
    }
}
