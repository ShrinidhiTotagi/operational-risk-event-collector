package com.internship.tool.seeder;

import com.internship.tool.entity.RiskEvent;
import com.internship.tool.repository.RiskEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final RiskEventRepository riskEventRepository;

    @Override
    public void run(String... args) {
        if (riskEventRepository.count() == 0) {
            log.info("Seeding initial data...");
            riskEventRepository.saveAll(buildEvents());
            log.info("Data seeding completed — 30 records inserted.");
        }
    }

    private List<RiskEvent> buildEvents() {
        LocalDateTime now = LocalDateTime.now();
        return List.of(
            event("Unauthorized Database Access Attempt", "A contractor account attempted to access the production database outside of approved hours. Access logs show 47 failed login attempts followed by a successful login using a shared credential.", "CRITICAL", "OPEN", "IT", now.minusDays(1), "security_team"),
            event("Payroll Processing Failure", "Monthly payroll batch job failed to execute due to a misconfigured SFTP connection to the payment gateway. Approximately 320 employees were affected and payments were delayed by 48 hours.", "HIGH", "RESOLVED", "FINANCE", now.minusDays(3), "finance_ops"),
            event("Employee Data Leak via Email", "An HR analyst accidentally sent a spreadsheet containing 150 employee records including salaries and personal addresses to an external vendor email address.", "CRITICAL", "IN_PROGRESS", "HR", now.minusDays(2), "hr_manager"),
            event("Third-Party API Outage", "The KYC verification API provided by our compliance vendor experienced a 6-hour outage, blocking all new customer onboarding processes during peak business hours.", "HIGH", "CLOSED", "COMPLIANCE", now.minusDays(5), "ops_team"),
            event("Server Room Cooling Failure", "Primary HVAC unit in the main data centre failed, causing server room temperature to rise to 38°C. Emergency cooling was activated after 2 hours, preventing hardware damage.", "HIGH", "RESOLVED", "OPERATIONS", now.minusDays(7), "facilities"),
            event("Phishing Attack on Finance Team", "Three members of the finance department received targeted spear-phishing emails impersonating the CFO. One employee clicked the link and entered credentials before IT intervention.", "CRITICAL", "IN_PROGRESS", "IT", now.minusDays(4), "security_team"),
            event("Regulatory Filing Deadline Missed", "Quarterly regulatory report to the financial authority was submitted 2 days late due to a miscommunication between the compliance and finance teams regarding the submission deadline.", "MEDIUM", "CLOSED", "COMPLIANCE", now.minusDays(10), "compliance_officer"),
            event("Vendor Contract Expiry Oversight", "A critical software maintenance contract with a key vendor expired without renewal, leaving 3 production systems without vendor support for 12 days.", "MEDIUM", "RESOLVED", "OPERATIONS", now.minusDays(15), "procurement"),
            event("Insider Trading Allegation", "An anonymous tip was received alleging that a senior trader executed trades based on non-public information. The matter has been escalated to the legal and compliance teams.", "CRITICAL", "OPEN", "COMPLIANCE", now.minusDays(2), "compliance_officer"),
            event("Network Intrusion Detection Alert", "IDS flagged unusual outbound traffic from a workstation in the trading floor. Investigation revealed malware installed via a USB device brought in by a temporary staff member.", "HIGH", "IN_PROGRESS", "IT", now.minusDays(1), "security_team"),
            event("Duplicate Payment Processing", "A system bug in the accounts payable module caused 28 vendor invoices to be processed twice, resulting in duplicate payments totalling $142,000.", "HIGH", "RESOLVED", "FINANCE", now.minusDays(8), "finance_ops"),
            event("Staff Misconduct — Expense Fraud", "Internal audit identified a pattern of inflated expense claims by a regional manager over a 6-month period. Total fraudulent claims amount to approximately $18,500.", "HIGH", "OPEN", "HR", now.minusDays(6), "internal_audit"),
            event("Business Continuity Plan Not Tested", "Annual BCP test was not conducted as scheduled due to resource constraints. The plan has not been validated against current infrastructure for 18 months.", "MEDIUM", "OPEN", "OPERATIONS", now.minusDays(20), "risk_manager"),
            event("Customer Data Retention Violation", "Audit found that customer records from closed accounts were retained for 9 years, exceeding the 7-year maximum retention period required by data protection regulations.", "MEDIUM", "IN_PROGRESS", "COMPLIANCE", now.minusDays(12), "data_officer"),
            event("Password Policy Non-Compliance", "IT audit revealed that 34% of user accounts have not changed passwords in over 180 days, violating the company's 90-day password rotation policy.", "MEDIUM", "IN_PROGRESS", "IT", now.minusDays(9), "it_admin"),
            event("Trading System Latency Spike", "Core trading platform experienced latency spikes of up to 800ms during market open, significantly above the 50ms SLA threshold. Root cause identified as a misconfigured load balancer.", "HIGH", "RESOLVED", "IT", now.minusDays(14), "platform_team"),
            event("Anti-Money Laundering Alert Backlog", "AML transaction monitoring system has accumulated a backlog of 1,200 unreviewed alerts due to understaffing in the compliance team. Oldest alert is 22 days old.", "CRITICAL", "OPEN", "COMPLIANCE", now.minusDays(3), "aml_team"),
            event("Office Flood — Document Destruction", "A burst pipe in the records storage room caused water damage to physical documents including original signed contracts. Approximately 40% of documents were unrecoverable.", "MEDIUM", "CLOSED", "OPERATIONS", now.minusDays(25), "facilities"),
            event("Incorrect Risk Weighting in Model", "Quantitative risk model used for capital allocation was found to contain an incorrect weighting factor for credit risk, potentially understating capital requirements by 8%.", "HIGH", "IN_PROGRESS", "FINANCE", now.minusDays(5), "risk_quant"),
            event("Unauthorised Software Installation", "Security scan detected 12 workstations with unauthorised remote access software installed. Investigation ongoing to determine if installations were malicious or accidental.", "MEDIUM", "IN_PROGRESS", "IT", now.minusDays(4), "security_team"),
            event("Key Person Dependency — CFO Absence", "CFO unexpectedly hospitalised for 3 weeks. No documented succession plan exists for the role, creating a single point of failure for financial decision-making.", "HIGH", "OPEN", "HR", now.minusDays(2), "hr_director"),
            event("Supplier Insolvency Risk", "Primary technology hardware supplier has filed for creditor protection. Outstanding orders worth $380,000 are at risk. Alternative suppliers have been identified but lead times are 8 weeks.", "MEDIUM", "OPEN", "OPERATIONS", now.minusDays(7), "procurement"),
            event("GDPR Subject Access Request Overdue", "14 GDPR subject access requests have exceeded the 30-day statutory response deadline. Regulatory penalties of up to €20 million or 4% of annual turnover may apply.", "HIGH", "OPEN", "COMPLIANCE", now.minusDays(1), "data_officer"),
            event("Backup Restoration Test Failure", "Monthly backup restoration test failed — backup files from the past 3 weeks were found to be corrupted due to a misconfigured backup agent. Live data was not affected.", "HIGH", "RESOLVED", "IT", now.minusDays(11), "it_ops"),
            event("Foreign Exchange Exposure Breach", "FX trading desk exceeded approved exposure limits by 23% due to a manual override of the risk management system. The breach was active for 4 hours before detection.", "CRITICAL", "CLOSED", "FINANCE", now.minusDays(18), "risk_manager"),
            event("Workplace Injury — Slip and Fall", "An employee sustained a fractured wrist after slipping on a wet floor in the main office lobby. The wet floor sign was not displayed. Incident has been reported to the relevant authority.", "LOW", "CLOSED", "HR", now.minusDays(30), "hr_manager"),
            event("Cloud Storage Misconfiguration", "An S3 bucket containing internal audit reports was inadvertently set to public access for approximately 6 hours before being detected by the cloud security monitoring tool.", "CRITICAL", "RESOLVED", "IT", now.minusDays(16), "cloud_team"),
            event("Training Compliance Gap", "Annual mandatory compliance training completion rate stands at 61%, below the required 95% threshold. Non-compliant staff include 3 members of senior management.", "LOW", "OPEN", "COMPLIANCE", now.minusDays(22), "compliance_officer"),
            event("Interest Rate Model Assumption Error", "Annual review identified that the interest rate stress testing model has been using outdated base rate assumptions since Q3 last year, affecting 6 quarterly risk reports.", "MEDIUM", "IN_PROGRESS", "FINANCE", now.minusDays(8), "risk_quant"),
            event("Physical Access Control Failure", "Badge reader on the server room door malfunctioned for 3 hours, allowing unrestricted physical access. CCTV footage has been reviewed and no unauthorised access was detected.", "LOW", "CLOSED", "OPERATIONS", now.minusDays(28), "facilities")
        );
    }

    private RiskEvent event(String title, String description, String severity, String status, String category, LocalDateTime occurredAt, String createdBy) {
        return RiskEvent.builder()
                .title(title)
                .description(description)
                .severity(severity)
                .status(status)
                .category(category)
                .occurredAt(occurredAt)
                .createdBy(createdBy)
                .isDeleted(false)
                .build();
    }
}
