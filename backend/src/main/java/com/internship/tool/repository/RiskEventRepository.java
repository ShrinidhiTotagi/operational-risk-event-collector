package com.internship.tool.repository;

import com.internship.tool.entity.RiskEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RiskEventRepository extends JpaRepository<RiskEvent, UUID> {
    
    Page<RiskEvent> findByIsDeletedFalse(Pageable pageable);
    
    List<RiskEvent> findByIsDeletedFalse();

    @Query("SELECT r FROM RiskEvent r WHERE r.isDeleted = false AND " +
           "(LOWER(r.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(r.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(r.category) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<RiskEvent> searchEvents(@Param("query") String query, Pageable pageable);
}
