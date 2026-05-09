package com.internship.tool.service;

import com.internship.tool.entity.RiskEvent;
import com.internship.tool.exception.ResourceNotFoundException;
import com.internship.tool.repository.RiskEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RiskEventServiceTest {

    @Mock
    private RiskEventRepository riskEventRepository;

    @InjectMocks
    private RiskEventService riskEventService;

    private RiskEvent mockEvent;
    private UUID eventId;

    @BeforeEach
    void setUp() {
        eventId = UUID.randomUUID();
        mockEvent = RiskEvent.builder()
                .id(eventId)
                .title("Unauthorized Access Attempt")
                .description("A contractor attempted to access production DB outside approved hours.")
                .status("OPEN")
                .severity("CRITICAL")
                .category("IT")
                .occurredAt(LocalDateTime.now().minusDays(1))
                .createdBy("security_team")
                .isDeleted(false)
                .build();
    }

    @Test
    void getAllEvents_ReturnsPaginatedResults() {
        Page<RiskEvent> page = new PageImpl<>(List.of(mockEvent));
        when(riskEventRepository.findAll(any(org.springframework.data.domain.Pageable.class))).thenReturn(page);

        Page<RiskEvent> result = riskEventService.getAllEvents(PageRequest.of(0, 10));

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("Unauthorized Access Attempt");
    }

    @Test
    void getEventById_WhenExists_ReturnsEvent() {
        when(riskEventRepository.findById(eventId)).thenReturn(Optional.of(mockEvent));

        RiskEvent result = riskEventService.getEventById(eventId);

        assertThat(result).isNotNull();
        assertThat(result.getSeverity()).isEqualTo("CRITICAL");
    }

    @Test
    void getEventById_WhenNotFound_ThrowsException() {
        when(riskEventRepository.findById(any(UUID.class))).thenReturn(Optional.empty());

        assertThatThrownBy(() -> riskEventService.getEventById(UUID.randomUUID()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void createEvent_SavesAndReturnsEvent() {
        when(riskEventRepository.save(any(RiskEvent.class))).thenReturn(mockEvent);

        RiskEvent result = riskEventService.createEvent(mockEvent);

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Unauthorized Access Attempt");
        verify(riskEventRepository, times(1)).save(any(RiskEvent.class));
    }

    @Test
    void updateEvent_WhenExists_UpdatesAndReturns() {
        RiskEvent updated = RiskEvent.builder()
                .id(eventId).title("Updated Title").description("Updated desc")
                .status("RESOLVED").severity("HIGH").category("IT")
                .occurredAt(LocalDateTime.now()).isDeleted(false).build();

        when(riskEventRepository.findById(eventId)).thenReturn(Optional.of(mockEvent));
        when(riskEventRepository.save(any(RiskEvent.class))).thenReturn(updated);

        RiskEvent result = riskEventService.updateEvent(eventId, updated);

        assertThat(result.getTitle()).isEqualTo("Updated Title");
        assertThat(result.getStatus()).isEqualTo("RESOLVED");
    }

    @Test
    void deleteEvent_WhenExists_SoftDeletes() {
        when(riskEventRepository.findById(eventId)).thenReturn(Optional.of(mockEvent));
        when(riskEventRepository.save(any(RiskEvent.class))).thenReturn(mockEvent);

        riskEventService.deleteEvent(eventId);

        verify(riskEventRepository, times(1)).save(argThat(RiskEvent::getIsDeleted));
    }

    @Test
    void deleteEvent_WhenNotFound_ThrowsException() {
        when(riskEventRepository.findById(any(UUID.class))).thenReturn(Optional.empty());

        assertThatThrownBy(() -> riskEventService.deleteEvent(UUID.randomUUID()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void createEvent_WithCriticalSeverity_Saves() {
        mockEvent.setSeverity("CRITICAL");
        when(riskEventRepository.save(any(RiskEvent.class))).thenReturn(mockEvent);

        RiskEvent result = riskEventService.createEvent(mockEvent);

        assertThat(result.getSeverity()).isEqualTo("CRITICAL");
    }

    @Test
    void updateEvent_WhenNotFound_ThrowsException() {
        when(riskEventRepository.findById(any(UUID.class))).thenReturn(Optional.empty());

        assertThatThrownBy(() -> riskEventService.updateEvent(UUID.randomUUID(), mockEvent))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void createEvent_SetsIsDeletedFalse() {
        when(riskEventRepository.save(any(RiskEvent.class))).thenReturn(mockEvent);

        RiskEvent result = riskEventService.createEvent(mockEvent);

        assertThat(result.getIsDeleted()).isFalse();
    }
}
