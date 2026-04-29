package com.internship.tool.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Getter @Setter
public class StatsResponse {
    private long totalEvents;
    private long openEvents;
    private long inProgressEvents;
    private long closedEvents;
    private long monitoringEvents;
    private BigDecimal totalLoss;
    private List<Map<String, Object>> byCategory;
    private List<Map<String, Object>> byStatus;
    private List<Map<String, Object>> lossByMonth;
}
