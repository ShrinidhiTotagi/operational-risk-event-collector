package com.internship.tool.service;

import com.internship.tool.entity.RiskEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final RiskEventService riskEventService;

    public Map<String, Object> getDashboardStats() {
        List<RiskEvent> allEvents = riskEventService.getAllEventsList();
        
        long totalEvents = allEvents.size();
        long openEvents = allEvents.stream().filter(e -> "OPEN".equals(e.getStatus()) || "IN_PROGRESS".equals(e.getStatus())).count();
        long criticalEvents = allEvents.stream().filter(e -> "CRITICAL".equals(e.getSeverity())).count();
        double avgAiScore = allEvents.stream()
                .filter(e -> e.getAiScore() != null)
                .mapToInt(RiskEvent::getAiScore)
                .average()
                .orElse(0.0);
                
        // Count by status for charts
        Map<String, Long> eventsByStatus = allEvents.stream()
                .collect(Collectors.groupingBy(RiskEvent::getStatus, Collectors.counting()));
                
        // Count by severity for charts
        Map<String, Long> eventsBySeverity = allEvents.stream()
                .collect(Collectors.groupingBy(RiskEvent::getSeverity, Collectors.counting()));

        // Count by category for charts
        Map<String, Long> eventsByCategory = allEvents.stream()
                .collect(Collectors.groupingBy(RiskEvent::getCategory, Collectors.counting()));

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEvents", totalEvents);
        stats.put("openEvents", openEvents);
        stats.put("criticalEvents", criticalEvents);
        stats.put("avgAiScore", Math.round(avgAiScore * 10.0) / 10.0); // Round to 1 decimal
        stats.put("eventsByStatus", eventsByStatus);
        stats.put("eventsBySeverity", eventsBySeverity);
        stats.put("eventsByCategory", eventsByCategory);
        
        return stats;
    }
}
