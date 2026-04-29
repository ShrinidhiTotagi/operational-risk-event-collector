package com.internship.tool.service;

import com.internship.tool.repository.OperationalRiskEventRepository;
import org.springframework.stereotype.Component;

import java.time.Year;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class ReferenceCodeGenerator {

    private final OperationalRiskEventRepository repository;
    private final AtomicInteger counter = new AtomicInteger(0);

    public ReferenceCodeGenerator(OperationalRiskEventRepository repository) {
        this.repository = repository;
    }

    public synchronized String next() {
        int year = Year.now().getValue();
        String candidate;
        do {
            int seq = counter.incrementAndGet();
            candidate = String.format("ORE-%d-%04d", year, seq);
        } while (repository.existsByReferenceCode(candidate));
        return candidate;
    }
}
