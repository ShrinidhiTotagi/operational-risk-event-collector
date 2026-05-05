package com.internship.tool.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.internship.tool.entity.RiskEvent;
import com.internship.tool.service.RiskEventService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RiskEventController.class)
public class RiskEventControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RiskEventService riskEventService;

    @Autowired
    private ObjectMapper objectMapper;

    private RiskEvent mockEvent;
    private UUID eventId;

    @BeforeEach
    void setUp() {
        eventId = UUID.randomUUID();
        mockEvent = RiskEvent.builder()
                .id(eventId)
                .title("Test Event")
                .description("Test Description")
                .status("OPEN")
                .severity("HIGH")
                .category("IT")
                .occurredAt(LocalDateTime.now())
                .isDeleted(false)
                .build();
    }

    @Test
    void getAllEvents_ReturnsPage() throws Exception {
        Page<RiskEvent> page = new PageImpl<>(Collections.singletonList(mockEvent));
        Mockito.when(riskEventService.getAllEvents(any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/events")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Test Event"));
    }

    @Test
    void getEventById_ReturnsEvent() throws Exception {
        Mockito.when(riskEventService.getEventById(eventId)).thenReturn(mockEvent);

        mockMvc.perform(get("/api/events/{id}", eventId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test Event"));
    }

    @Test
    void createEvent_ReturnsCreatedEvent() throws Exception {
        Mockito.when(riskEventService.createEvent(any(RiskEvent.class))).thenReturn(mockEvent);

        mockMvc.perform(post("/api/events")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(mockEvent)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Test Event"));
    }

    @Test
    void updateEvent_ReturnsUpdatedEvent() throws Exception {
        Mockito.when(riskEventService.updateEvent(eq(eventId), any(RiskEvent.class))).thenReturn(mockEvent);

        mockMvc.perform(put("/api/events/{id}", eventId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(mockEvent)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test Event"));
    }

    @Test
    void deleteEvent_ReturnsNoContent() throws Exception {
        Mockito.doNothing().when(riskEventService).deleteEvent(eventId);

        mockMvc.perform(delete("/api/events/{id}", eventId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());
    }
}
