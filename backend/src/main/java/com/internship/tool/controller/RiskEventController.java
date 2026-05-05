package com.internship.tool.controller;

import com.internship.tool.entity.RiskEvent;
import com.internship.tool.service.RiskEventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@Tag(name = "Risk Events", description = "Risk Event Management APIs")
@CrossOrigin(origins = "*") // For development
public class RiskEventController {

    private final RiskEventService riskEventService;

    @GetMapping
    @Operation(summary = "Get all risk events with pagination")
    public ResponseEntity<Page<RiskEvent>> getAllEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "occurredAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
            
        Sort sort = direction.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(riskEventService.getAllEvents(pageable));
    }

    @GetMapping("/search")
    @Operation(summary = "Search risk events")
    public ResponseEntity<Page<RiskEvent>> searchEvents(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("occurredAt").descending());
        return ResponseEntity.ok(riskEventService.searchEvents(q, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a risk event by ID")
    public ResponseEntity<RiskEvent> getEventById(@PathVariable UUID id) {
        return ResponseEntity.ok(riskEventService.getEventById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new risk event")
    public ResponseEntity<RiskEvent> createEvent(@RequestBody RiskEvent riskEvent) {
        return new ResponseEntity<>(riskEventService.createEvent(riskEvent), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing risk event")
    public ResponseEntity<RiskEvent> updateEvent(@PathVariable UUID id, @RequestBody RiskEvent riskEvent) {
        return ResponseEntity.ok(riskEventService.updateEvent(id, riskEvent));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete a risk event")
    public ResponseEntity<Void> deleteEvent(@PathVariable UUID id) {
        riskEventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
}
