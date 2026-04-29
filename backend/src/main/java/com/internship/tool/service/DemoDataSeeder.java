package com.internship.tool.service;

import com.internship.tool.entity.OperationalRiskEvent;
import com.internship.tool.repository.OperationalRiskEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
@Order(2)
public class DemoDataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

    private final OperationalRiskEventRepository repository;
    private final ReferenceCodeGenerator codeGenerator;
    private final boolean enabled;

    public DemoDataSeeder(OperationalRiskEventRepository repository,
                          ReferenceCodeGenerator codeGenerator,
                          @Value("${app.enable-demo-seed}") boolean enabled) {
        this.repository = repository;
        this.codeGenerator = codeGenerator;
        this.enabled = enabled;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!enabled) return;
        if (repository.countActive() > 0) {
            log.info("Demo seed skipped – data already exists");
            return;
        }
        log.info("Seeding 30 demo operational risk events...");

        String[][] seeds = {
            {"IT system outage during peak trading hours","IT","FINANCIAL","OPEN","Technology failure caused 4-hour trading system downtime","5","4","250000"},
            {"Unauthorized data access by contractor","IT","REGULATORY","IN_PROGRESS","Contractor accessed PII beyond authorized scope","4","5","0"},
            {"Payment processing error – duplicate transactions","PROCESS","FINANCIAL","CLOSED","Batch job defect caused 1,200 duplicate payments","3","5","180000"},
            {"AML screening system false negatives","LEGAL","REGULATORY","MONITORING","Screening model missed 15 high-risk transactions","4","5","0"},
            {"Key employee resignation – treasury desk","PEOPLE","OPERATIONAL","OPEN","Senior trader resigned without adequate succession plan","3","4","0"},
            {"Third-party vendor data breach","THIRD_PARTY","REPUTATIONAL","IN_PROGRESS","Payroll vendor suffered ransomware attack exposing employee data","4","4","95000"},
            {"Incorrect regulatory capital calculation","PROCESS","REGULATORY","CLOSED","Spreadsheet error in RWA calculation submitted to regulator","3","5","0"},
            {"Physical security breach – server room","IT","OPERATIONAL","OPEN","Tailgating incident allowed unauthorized access to data center","2","4","0"},
            {"Mis-selling of investment product","PEOPLE","REGULATORY","MONITORING","Advisor sold unsuitable product to retail client","3","5","320000"},
            {"Business continuity plan not tested","PROCESS","OPERATIONAL","OPEN","Annual BCP test not conducted for 18 months","2","3","0"},
            {"Phishing attack – finance team","IT","FINANCIAL","CLOSED","CFO email spoofed; wire transfer of $45k initiated","4","4","45000"},
            {"Model risk – credit scoring error","PROCESS","FINANCIAL","IN_PROGRESS","Credit model overestimated creditworthiness for SME segment","3","4","120000"},
            {"GDPR data subject request breach","LEGAL","REGULATORY","CLOSED","Response to DSR exceeded 30-day statutory deadline","2","3","15000"},
            {"Outsourced IT provider SLA breach","THIRD_PARTY","OPERATIONAL","MONITORING","Core banking provider missed 99.9% uptime SLA for Q3","3","3","0"},
            {"Rogue trade – derivatives desk","PEOPLE","FINANCIAL","CLOSED","Unauthorized position taken exceeding risk limits","5","5","1200000"},
            {"Flood damage – branch office","PROCESS","OPERATIONAL","CLOSED","Basement server room flooded during storm event","2","3","85000"},
            {"Sanctions screening gap","LEGAL","REGULATORY","IN_PROGRESS","New sanctions list not loaded within required 24-hour window","4","5","0"},
            {"HR payroll overpayment","PROCESS","FINANCIAL","CLOSED","System migration error caused 200 staff overpaid for 2 months","3","3","67000"},
            {"Cyber intrusion – attempted SQL injection","IT","OPERATIONAL","MONITORING","Web application firewall blocked 3,000 injection attempts","3","3","0"},
            {"Inadequate KYC documentation","LEGAL","REGULATORY","OPEN","Onboarding team accepted incomplete KYC for 45 accounts","3","4","0"},
            {"Trading system latency spike","IT","FINANCIAL","CLOSED","Network misconfiguration caused 800ms latency on FX desk","4","3","32000"},
            {"Whistleblower complaint – expense fraud","PEOPLE","FINANCIAL","IN_PROGRESS","Senior manager alleged to have falsified travel expenses","3","4","28000"},
            {"Cloud misconfiguration – S3 bucket exposed","IT","REPUTATIONAL","CLOSED","Public S3 bucket exposed non-sensitive config files for 6 hours","3","3","0"},
            {"Supplier concentration risk materialised","THIRD_PARTY","OPERATIONAL","MONITORING","Single supplier for critical component ceased operations","4","4","0"},
            {"Interest rate swap mis-booking","PROCESS","FINANCIAL","CLOSED","Trade booked with incorrect notional; P&L impact $90k","3","4","90000"},
            {"Staff training non-compliance","PEOPLE","REGULATORY","OPEN","35% of staff overdue on mandatory AML training","2","3","0"},
            {"ATM skimming device discovered","IT","FINANCIAL","CLOSED","Skimming device found on 3 ATMs; 120 cards compromised","4","4","54000"},
            {"Liquidity stress test model failure","PROCESS","REGULATORY","IN_PROGRESS","LCR model produced negative values under stress scenario","4","5","0"},
            {"Vendor invoice fraud","THIRD_PARTY","FINANCIAL","CLOSED","Fraudulent invoices submitted by impersonating legitimate vendor","4","4","76000"},
            {"Data retention policy breach","LEGAL","REGULATORY","MONITORING","Customer records retained beyond 7-year statutory limit","2","3","0"}
        };

        String[] units = {"Retail Banking","Corporate Banking","Treasury","Operations","Compliance","IT","HR","Finance"};

        for (int i = 0; i < seeds.length; i++) {
            String[] s = seeds[i];
            OperationalRiskEvent e = new OperationalRiskEvent();
            e.setReferenceCode(codeGenerator.next());
            e.setTitle(s[0]);
            e.setCategory(s[1]);
            e.setImpactType(s[2]);
            e.setStatus(s[3]);
            e.setDescription(s[4]);
            e.setLikelihood(Short.parseShort(s[5]));
            e.setImpact(Short.parseShort(s[6]));
            e.setLossAmount(new BigDecimal(s[7]));
            e.setCurrency("USD");
            e.setBusinessUnit(units[i % units.length]);
            e.setIncidentDate(LocalDate.now().minusDays(10L + i * 7));
            e.setDiscoveryDate(LocalDate.now().minusDays(8L + i * 7));
            if ("CLOSED".equals(s[3])) e.setClosureDate(LocalDate.now().minusDays(2L + i));
            e.setCreatedBy("seeder");
            e.setUpdatedBy("seeder");
            repository.save(e);
        }
        log.info("Demo seed complete – 30 events inserted");
    }
}
