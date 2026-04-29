package com.internship.tool.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.internship.tool.dto.*;
import com.internship.tool.entity.OperationalRiskEvent;
import com.internship.tool.exception.ResourceNotFoundException;
import com.internship.tool.repository.OperationalRiskEventRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.StringWriter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
public class OperationalRiskEventService {

    private final OperationalRiskEventRepository repository;
    private final EventMapper mapper;
    private final AuditService auditService;
    private final ReferenceCodeGenerator codeGenerator;
    private final ObjectMapper objectMapper;

    public OperationalRiskEventService(OperationalRiskEventRepository repository,
                                       EventMapper mapper,
                                       AuditService auditService,
                                       ReferenceCodeGenerator codeGenerator,
                                       ObjectMapper objectMapper) {
        this.repository = repository;
        this.mapper = mapper;
        this.auditService = auditService;
        this.codeGenerator = codeGenerator;
        this.objectMapper = objectMapper;
    }

    @Cacheable(value = "events", key = "#page + '-' + #size + '-' + #status + '-' + #category + '-' + #dateFrom + '-' + #dateTo + '-' + #search")
    public PagedResponse<EventResponse> list(int page, int size, String status, String category,
                                              LocalDate dateFrom, LocalDate dateTo, String search) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<OperationalRiskEvent> result = repository.findAllFiltered(
                emptyToNull(status), emptyToNull(category), dateFrom, dateTo, emptyToNull(search), pageable);
        List<EventResponse> content = result.getContent().stream().map(mapper::toResponse).toList();
        return new PagedResponse<>(content, page, size, result.getTotalElements(), result.getTotalPages());
    }

    @Cacheable(value = "event", key = "#id")
    public EventResponse getById(UUID id) {
        return mapper.toResponse(findActive(id));
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "events", allEntries = true),
        @CacheEvict(value = "stats", key = "'global'")
    })
    public EventResponse create(EventRequest req, String username) {
        OperationalRiskEvent event = new OperationalRiskEvent();
        event.setReferenceCode(codeGenerator.next());
        event.setCreatedBy(username);
        event.setUpdatedBy(username);
        mapper.applyRequest(req, event);
        OperationalRiskEvent saved = repository.save(event);
        auditService.log(saved.getId(), "CREATE", null, toJson(saved), username);
        return mapper.toResponse(saved);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "events", allEntries = true),
        @CacheEvict(value = "event", key = "#id"),
        @CacheEvict(value = "stats", key = "'global'")
    })
    public EventResponse update(UUID id, EventRequest req, String username) {
        OperationalRiskEvent event = findActive(id);
        String oldJson = toJson(event);
        event.setUpdatedBy(username);
        mapper.applyRequest(req, event);
        OperationalRiskEvent saved = repository.save(event);
        auditService.log(saved.getId(), "UPDATE", oldJson, toJson(saved), username);
        return mapper.toResponse(saved);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "events", allEntries = true),
        @CacheEvict(value = "event", key = "#id"),
        @CacheEvict(value = "stats", key = "'global'")
    })
    public void delete(UUID id, String username) {
        OperationalRiskEvent event = findActive(id);
        String oldJson = toJson(event);
        event.setDeleted(true);
        event.setUpdatedBy(username);
        repository.save(event);
        auditService.log(id, "DELETE", oldJson, null, username);
    }

    @Cacheable(value = "stats", key = "'global'")
    public StatsResponse stats() {
        StatsResponse s = new StatsResponse();
        s.setTotalEvents(repository.countActive());
        s.setOpenEvents(repository.countByStatus("OPEN"));
        s.setInProgressEvents(repository.countByStatus("IN_PROGRESS"));
        s.setClosedEvents(repository.countByStatus("CLOSED"));
        s.setMonitoringEvents(repository.countByStatus("MONITORING"));
        s.setTotalLoss(repository.sumLossAmount());

        s.setByCategory(toMapList(repository.countByCategory(), "category", "count"));
        s.setByStatus(toMapList(repository.countByStatusGrouped(), "status", "count"));
        s.setLossByMonth(toMapList(repository.lossAmountByMonth(), "month", "loss"));
        return s;
    }

    public String exportCsv(String status, String category, LocalDate dateFrom, LocalDate dateTo, String search) {
        List<OperationalRiskEvent> events = repository.findAllForExport(
                emptyToNull(status), emptyToNull(category), dateFrom, dateTo, emptyToNull(search));
        StringWriter sw = new StringWriter();
        sw.write("Reference,Title,Category,Status,Incident Date,Loss Amount,Currency,Likelihood,Impact,Risk Score,Business Unit,Created By,Created At\n");
        for (OperationalRiskEvent e : events) {
            sw.write(String.join(",",
                    q(e.getReferenceCode()), q(e.getTitle()), q(e.getCategory()), q(e.getStatus()),
                    q(e.getIncidentDate()), q(e.getLossAmount()), q(e.getCurrency()),
                    q(e.getLikelihood()), q(e.getImpact()), q(e.getInherentRiskScore()),
                    q(e.getBusinessUnit()), q(e.getCreatedBy()), q(e.getCreatedAt())
            ) + "\n");
        }
        return sw.toString();
    }

    private OperationalRiskEvent findActive(UUID id) {
        return repository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + id));
    }

    private List<Map<String, Object>> toMapList(List<Object[]> rows, String key1, String key2) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put(key1, row[0]);
            m.put(key2, row[1]);
            result.add(m);
        }
        return result;
    }

    private String toJson(Object obj) {
        try { return objectMapper.writeValueAsString(obj); } catch (Exception e) { return "{}"; }
    }

    private String emptyToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }

    private String q(Object val) {
        if (val == null) return "";
        String s = val.toString().replace("\"", "\"\"");
        return s.contains(",") ? "\"" + s + "\"" : s;
    }
}
