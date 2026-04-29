package com.internship.tool.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter
public class EventResponse {
    private UUID id;
    private String referenceCode;
    private String title;
    private String description;
    private String status;
    private String category;
    private String subCategory;
    private String businessUnit;
    private String department;
    private String location;
    private String impactType;
    private Short likelihood;
    private Short impact;
    private Short inherentRiskScore;
    private Short residualRiskScore;
    private BigDecimal lossAmount;
    private String currency;
    private LocalDate incidentDate;
    private LocalDate discoveryDate;
    private LocalDate closureDate;
    private String rootCause;
    private String controlFailures;
    private String kri;
    private String actionPlan;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
}
