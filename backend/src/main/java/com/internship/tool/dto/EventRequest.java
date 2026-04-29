package com.internship.tool.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter
public class EventRequest {

    @NotBlank @Size(max = 255)
    private String title;

    private String description;

    @NotBlank
    @Pattern(regexp = "OPEN|IN_PROGRESS|CLOSED|MONITORING")
    private String status = "OPEN";

    @NotBlank @Size(max = 50)
    private String category;

    @Size(max = 100)
    private String subCategory;

    @Size(max = 100)
    private String businessUnit;

    @Size(max = 100)
    private String department;

    @Size(max = 100)
    private String location;

    @Size(max = 50)
    private String impactType;

    @Min(1) @Max(5)
    private Short likelihood;

    @Min(1) @Max(5)
    private Short impact;

    @Min(0) @Max(5)
    private Short residualRiskScore;

    @DecimalMin("0.00")
    private BigDecimal lossAmount;

    @Size(max = 3)
    private String currency = "USD";

    private LocalDate incidentDate;
    private LocalDate discoveryDate;
    private LocalDate closureDate;

    private String rootCause;
    private String controlFailures;
    private String kri;
    private String actionPlan;
}
