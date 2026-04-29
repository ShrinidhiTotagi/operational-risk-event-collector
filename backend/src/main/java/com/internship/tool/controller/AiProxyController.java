package com.internship.tool.controller;

import com.internship.tool.config.AiServiceClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiProxyController {

    private final AiServiceClient aiServiceClient;

    public AiProxyController(AiServiceClient aiServiceClient) {
        this.aiServiceClient = aiServiceClient;
    }

    @PostMapping("/describe")
    public ResponseEntity<Map<?, ?>> describe(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(aiServiceClient.describe(payload));
    }

    @PostMapping("/recommend")
    public ResponseEntity<Map<?, ?>> recommend(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(aiServiceClient.recommend(payload));
    }

    @PostMapping("/generate-report")
    public ResponseEntity<Map<?, ?>> generateReport(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(aiServiceClient.generateReport(payload));
    }
}
