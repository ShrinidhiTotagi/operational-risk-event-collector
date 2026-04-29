package com.internship.tool;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.internship.tool.config.JwtUtil;
import com.internship.tool.dto.EventRequest;
import com.internship.tool.dto.EventResponse;
import com.internship.tool.dto.PagedResponse;
import com.internship.tool.dto.StatsResponse;
import com.internship.tool.entity.OperationalRiskEvent;
import com.internship.tool.exception.ResourceNotFoundException;
import com.internship.tool.repository.OperationalRiskEventRepository;
import com.internship.tool.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class Tool66ApplicationTests {

    @Mock OperationalRiskEventRepository repository;
    @Mock AuditService auditService;
    @Mock ReferenceCodeGenerator codeGenerator;

    private EventMapper mapper;
    private OperationalRiskEventService service;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();
        mapper = new EventMapper();
        service = new OperationalRiskEventService(repository, mapper, auditService, codeGenerator, objectMapper);
    }

    // --- Service: create ---

    @Test
    void create_savesEventAndReturnsResponse() {
        when(codeGenerator.next()).thenReturn("ORE-2026-0001");
        OperationalRiskEvent saved = sampleEvent("ORE-2026-0001");
        when(repository.save(any())).thenReturn(saved);

        EventRequest req = sampleRequest();
        EventResponse resp = service.create(req, "admin");

        assertThat(resp.getReferenceCode()).isEqualTo("ORE-2026-0001");
        assertThat(resp.getTitle()).isEqualTo("Test Event");
        verify(auditService).log(any(), eq("CREATE"), isNull(), anyString(), eq("admin"));
    }

    // --- Service: getById – found ---

    @Test
    void getById_returnsEvent_whenExists() {
        OperationalRiskEvent e = sampleEvent("ORE-2026-0002");
        when(repository.findByIdAndDeletedFalse(e.getId())).thenReturn(Optional.of(e));

        EventResponse resp = service.getById(e.getId());
        assertThat(resp.getId()).isEqualTo(e.getId());
    }

    // --- Service: getById – not found ---

    @Test
    void getById_throwsNotFound_whenMissing() {
        UUID id = UUID.randomUUID();
        when(repository.findByIdAndDeletedFalse(id)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.getById(id))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // --- Service: update ---

    @Test
    void update_modifiesEventAndAudits() {
        OperationalRiskEvent existing = sampleEvent("ORE-2026-0003");
        when(repository.findByIdAndDeletedFalse(existing.getId())).thenReturn(Optional.of(existing));
        when(repository.save(any())).thenReturn(existing);

        EventRequest req = sampleRequest();
        req.setTitle("Updated Title");
        EventResponse resp = service.update(existing.getId(), req, "officer");

        verify(auditService).log(any(), eq("UPDATE"), anyString(), anyString(), eq("officer"));
    }

    // --- Service: delete ---

    @Test
    void delete_softDeletesEvent() {
        OperationalRiskEvent e = sampleEvent("ORE-2026-0004");
        when(repository.findByIdAndDeletedFalse(e.getId())).thenReturn(Optional.of(e));
        when(repository.save(any())).thenReturn(e);

        service.delete(e.getId(), "admin");

        assertThat(e.isDeleted()).isTrue();
        verify(auditService).log(any(), eq("DELETE"), anyString(), isNull(), eq("admin"));
    }

    // --- Service: list ---

    @Test
    void list_returnsPaginatedResponse() {
        OperationalRiskEvent e = sampleEvent("ORE-2026-0005");
        when(repository.findAllFiltered(any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(e)));

        PagedResponse<EventResponse> resp = service.list(0, 20, null, null, null, null, null);
        assertThat(resp.getContent()).hasSize(1);
        assertThat(resp.getTotalElements()).isEqualTo(1);
    }

    // --- Service: stats ---

    @Test
    void stats_returnsAggregatedData() {
        when(repository.countActive()).thenReturn(10L);
        when(repository.countByStatus("OPEN")).thenReturn(4L);
        when(repository.countByStatus("IN_PROGRESS")).thenReturn(3L);
        when(repository.countByStatus("CLOSED")).thenReturn(2L);
        when(repository.countByStatus("MONITORING")).thenReturn(1L);
        when(repository.sumLossAmount()).thenReturn(BigDecimal.valueOf(500000));
        when(repository.countByCategory()).thenReturn(List.of());
        when(repository.countByStatusGrouped()).thenReturn(List.of());
        when(repository.lossAmountByMonth()).thenReturn(List.of());

        StatsResponse stats = service.stats();
        assertThat(stats.getTotalEvents()).isEqualTo(10);
        assertThat(stats.getOpenEvents()).isEqualTo(4);
        assertThat(stats.getTotalLoss()).isEqualByComparingTo(BigDecimal.valueOf(500000));
    }

    // --- Service: exportCsv ---

    @Test
    void exportCsv_returnsCsvString() {
        OperationalRiskEvent e = sampleEvent("ORE-2026-0006");
        when(repository.findAllForExport(any(), any(), any(), any(), any())).thenReturn(List.of(e));

        String csv = service.exportCsv(null, null, null, null, null);
        assertThat(csv).contains("Reference");
        assertThat(csv).contains("ORE-2026-0006");
    }

    // --- JwtUtil ---

    @Test
    void jwtUtil_generateAndValidate() {
        JwtUtil jwtUtil = new JwtUtil("test-secret-key-must-be-at-least-32-chars!!", 60L);
        String token = jwtUtil.generateToken("alice", "ROLE_ADMIN");
        assertThat(jwtUtil.isValid(token)).isTrue();
        assertThat(jwtUtil.extractUsername(token)).isEqualTo("alice");
        assertThat(jwtUtil.extractRoles(token)).isEqualTo("ROLE_ADMIN");
    }

    @Test
    void jwtUtil_invalidToken_returnsFalse() {
        JwtUtil jwtUtil = new JwtUtil("test-secret-key-must-be-at-least-32-chars!!", 60L);
        assertThat(jwtUtil.isValid("not.a.token")).isFalse();
    }

    // --- EventMapper ---

    @Test
    void eventMapper_toResponse_mapsAllFields() {
        OperationalRiskEvent e = sampleEvent("ORE-2026-0007");
        e.setLossAmount(BigDecimal.valueOf(1000));
        EventResponse r = mapper.toResponse(e);
        assertThat(r.getReferenceCode()).isEqualTo("ORE-2026-0007");
        assertThat(r.getLossAmount()).isEqualByComparingTo(BigDecimal.valueOf(1000));
    }

    @Test
    void eventMapper_applyRequest_updatesEntity() {
        OperationalRiskEvent e = new OperationalRiskEvent();
        EventRequest req = sampleRequest();
        req.setCategory("LEGAL");
        mapper.applyRequest(req, e);
        assertThat(e.getCategory()).isEqualTo("LEGAL");
        assertThat(e.getTitle()).isEqualTo("Test Event");
    }

    // --- Helpers ---

    private OperationalRiskEvent sampleEvent(String refCode) {
        OperationalRiskEvent e = new OperationalRiskEvent();
        e.setId(UUID.randomUUID());
        e.setReferenceCode(refCode);
        e.setTitle("Test Event");
        e.setCategory("IT");
        e.setStatus("OPEN");
        e.setIncidentDate(LocalDate.now().minusDays(5));
        return e;
    }

    private EventRequest sampleRequest() {
        EventRequest req = new EventRequest();
        req.setTitle("Test Event");
        req.setCategory("IT");
        req.setStatus("OPEN");
        return req;
    }
}
