package com.internship.tool.controller;

import com.internship.tool.entity.RiskEvent;
import com.internship.tool.service.RiskEventService;
import com.opencsv.CSVWriter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.StringWriter;
import java.util.List;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Tag(name = "Files", description = "File Upload and Export APIs")
@CrossOrigin(origins = "*")
public class FileController {

    private final RiskEventService riskEventService;

    @GetMapping("/export")
    @Operation(summary = "Export risk events to CSV")
    public ResponseEntity<byte[]> exportToCsv() {
        List<RiskEvent> events = riskEventService.getAllEventsList();

        try (StringWriter sw = new StringWriter();
             CSVWriter csvWriter = new CSVWriter(sw)) {

            // Header
            String[] header = {"ID", "Title", "Status", "Severity", "Category", "Occurred At", "Created At"};
            csvWriter.writeNext(header);

            // Data
            for (RiskEvent event : events) {
                String[] data = {
                        event.getId().toString(),
                        event.getTitle(),
                        event.getStatus(),
                        event.getSeverity(),
                        event.getCategory(),
                        event.getOccurredAt() != null ? event.getOccurredAt().toString() : "",
                        event.getCreatedAt() != null ? event.getCreatedAt().toString() : ""
                };
                csvWriter.writeNext(data);
            }

            byte[] csvBytes = sw.toString().getBytes();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            headers.setContentDispositionFormData("attachment", "risk_events.csv");

            return new ResponseEntity<>(csvBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/upload")
    @Operation(summary = "Upload a file (Mock implementation)")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please select a file to upload.");
        }
        
        // Basic validation
        String contentType = file.getContentType();
        long size = file.getSize();
        
        if (size > 10 * 1024 * 1024) { // 10MB
            return ResponseEntity.badRequest().body("File size exceeds 10MB limit.");
        }

        // Just returning success for now
        return ResponseEntity.ok("File uploaded successfully: " + file.getOriginalFilename());
    }
}
