package com.internship.tool.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "operational_risk_event")
@Getter @Setter
public class OperationalRiskEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "reference_code", nullable = false, unique = true, length = 20)
    private String referenceCode;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "text")
    @JdbcTypeCode(SqlTypes.LONGVARCHAR)
    private String description;

    @Column(nullable = false, length = 20)
    private String status = "OPEN";

    @Column(nullable = false, length = 50)
    private String category;

    @Column(name = "sub_category", length = 100)
    private String subCategory;

    @Column(name = "business_unit", length = 100)
    private String businessUnit;

    @Column(length = 100)
    private String department;

    @Column(length = 100)
    private String location;

    @Column(name = "impact_type", length = 50)
    private String impactType;

    @Column
    private Short likelihood;

    @Column
    private Short impact;

    @Column(name = "inherent_risk_score", insertable = false, updatable = false)
    private Short inherentRiskScore;

    @Column(name = "residual_risk_score")
    private Short residualRiskScore;

    @Column(name = "loss_amount", precision = 18, scale = 2)
    private BigDecimal lossAmount;

    @Column(length = 3)
    private String currency = "USD";

    @Column(name = "incident_date")
    private LocalDate incidentDate;

    @Column(name = "discovery_date")
    private LocalDate discoveryDate;

    @Column(name = "closure_date")
    private LocalDate closureDate;

    @Column(name = "root_cause", columnDefinition = "text")
    @JdbcTypeCode(SqlTypes.LONGVARCHAR)
    private String rootCause;

    @Column(name = "control_failures", columnDefinition = "text")
    @JdbcTypeCode(SqlTypes.LONGVARCHAR)
    private String controlFailures;

    @Column(columnDefinition = "text")
    @JdbcTypeCode(SqlTypes.LONGVARCHAR)
    private String kri;

    @Column(name = "action_plan", columnDefinition = "text")
    @JdbcTypeCode(SqlTypes.LONGVARCHAR)
    private String actionPlan;

    @Column(nullable = false)
    private boolean deleted = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @PrePersist
    void onPersist() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
