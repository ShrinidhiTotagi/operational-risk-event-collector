package com.internship.tool.repository;

import com.internship.tool.entity.OperationalRiskEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OperationalRiskEventRepository extends JpaRepository<OperationalRiskEvent, UUID> {

    Optional<OperationalRiskEvent> findByIdAndDeletedFalse(UUID id);

    @Query("""
        SELECT e FROM OperationalRiskEvent e
        WHERE e.deleted = false
          AND (:status IS NULL OR e.status = :status)
          AND (:category IS NULL OR e.category = :category)
          AND (:dateFrom IS NULL OR e.incidentDate >= :dateFrom)
          AND (:dateTo IS NULL OR e.incidentDate <= :dateTo)
          AND (:search IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(e.description) LIKE LOWER(CONCAT('%', :search, '%')))
        """)
    Page<OperationalRiskEvent> findAllFiltered(
        @Param("status") String status,
        @Param("category") String category,
        @Param("dateFrom") LocalDate dateFrom,
        @Param("dateTo") LocalDate dateTo,
        @Param("search") String search,
        Pageable pageable
    );

    @Query("SELECT COUNT(e) FROM OperationalRiskEvent e WHERE e.deleted = false")
    long countActive();

    @Query("SELECT COUNT(e) FROM OperationalRiskEvent e WHERE e.deleted = false AND e.status = :status")
    long countByStatus(@Param("status") String status);

    @Query("SELECT COALESCE(SUM(e.lossAmount), 0) FROM OperationalRiskEvent e WHERE e.deleted = false")
    BigDecimal sumLossAmount();

    @Query("""
        SELECT e.category, COUNT(e) FROM OperationalRiskEvent e
        WHERE e.deleted = false
        GROUP BY e.category
        ORDER BY COUNT(e) DESC
        """)
    List<Object[]> countByCategory();

    @Query("""
        SELECT e.status, COUNT(e) FROM OperationalRiskEvent e
        WHERE e.deleted = false
        GROUP BY e.status
        """)
    List<Object[]> countByStatusGrouped();

    @Query(value = """
        SELECT TO_CHAR(incident_date, 'YYYY-MM') as month, COALESCE(SUM(loss_amount), 0) as loss
        FROM operational_risk_event
        WHERE deleted = false AND incident_date IS NOT NULL
        GROUP BY TO_CHAR(incident_date, 'YYYY-MM')
        ORDER BY TO_CHAR(incident_date, 'YYYY-MM')
        """, nativeQuery = true)
    List<Object[]> lossAmountByMonth();

    @Query("""
        SELECT e FROM OperationalRiskEvent e
        WHERE e.deleted = false
          AND (:status IS NULL OR e.status = :status)
          AND (:category IS NULL OR e.category = :category)
          AND (:dateFrom IS NULL OR e.incidentDate >= :dateFrom)
          AND (:dateTo IS NULL OR e.incidentDate <= :dateTo)
          AND (:search IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY e.createdAt DESC
        """)
    List<OperationalRiskEvent> findAllForExport(
        @Param("status") String status,
        @Param("category") String category,
        @Param("dateFrom") LocalDate dateFrom,
        @Param("dateTo") LocalDate dateTo,
        @Param("search") String search
    );

    boolean existsByReferenceCode(String referenceCode);

    @Query("""
        SELECT e FROM OperationalRiskEvent e
        WHERE e.deleted = false
          AND e.status IN ('OPEN', 'IN_PROGRESS')
          AND e.incidentDate <= :threshold
        """)
    List<OperationalRiskEvent> findOverdueEvents(@Param("threshold") LocalDate threshold);
}
