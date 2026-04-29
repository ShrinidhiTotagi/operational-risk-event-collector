package com.internship.tool.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

import java.util.Map;

@Component
public class AiServiceClient {

    private static final Logger log = LoggerFactory.getLogger(AiServiceClient.class);

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public AiServiceClient(
            @Value("${app.ai-service-url}") String baseUrl,
            @Value("${app.ai-service-timeout-seconds}") int timeoutSeconds) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(timeoutSeconds * 1000);
        factory.setReadTimeout(timeoutSeconds * 1000);
        this.restTemplate = new RestTemplate(factory);
        this.baseUrl = baseUrl;
    }

    public Map<?, ?> describe(Map<String, Object> payload) {
        return post("/api/ai/describe", payload);
    }

    public Map<?, ?> recommend(Map<String, Object> payload) {
        return post("/api/ai/recommend", payload);
    }

    public Map<?, ?> generateReport(Map<String, Object> payload) {
        return post("/api/ai/generate-report", payload);
    }

    private Map<?, ?> post(String path, Object body) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            ResponseEntity<Map> response = restTemplate.exchange(
                    baseUrl + path,
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    Map.class
            );
            return response.getBody();
        } catch (Exception e) {
            log.warn("AI service call to {} failed: {}", path, e.getMessage());
            return Map.of("is_fallback", true, "error", "AI service unavailable");
        }
    }
}
