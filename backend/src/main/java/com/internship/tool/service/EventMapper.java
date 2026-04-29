package com.internship.tool.service;

import com.internship.tool.dto.EventRequest;
import com.internship.tool.dto.EventResponse;
import com.internship.tool.entity.OperationalRiskEvent;
import org.springframework.stereotype.Component;

@Component
public class EventMapper {

    public EventResponse toResponse(OperationalRiskEvent e) {
        EventResponse r = new EventResponse();
        r.setId(e.getId());
        r.setReferenceCode(e.getReferenceCode());
        r.setTitle(e.getTitle());
        r.setDescription(e.getDescription());
        r.setStatus(e.getStatus());
        r.setCategory(e.getCategory());
        r.setSubCategory(e.getSubCategory());
        r.setBusinessUnit(e.getBusinessUnit());
        r.setDepartment(e.getDepartment());
        r.setLocation(e.getLocation());
        r.setImpactType(e.getImpactType());
        r.setLikelihood(e.getLikelihood());
        r.setImpact(e.getImpact());
        r.setInherentRiskScore(e.getInherentRiskScore());
        r.setResidualRiskScore(e.getResidualRiskScore());
        r.setLossAmount(e.getLossAmount());
        r.setCurrency(e.getCurrency());
        r.setIncidentDate(e.getIncidentDate());
        r.setDiscoveryDate(e.getDiscoveryDate());
        r.setClosureDate(e.getClosureDate());
        r.setRootCause(e.getRootCause());
        r.setControlFailures(e.getControlFailures());
        r.setKri(e.getKri());
        r.setActionPlan(e.getActionPlan());
        r.setCreatedAt(e.getCreatedAt());
        r.setUpdatedAt(e.getUpdatedAt());
        r.setCreatedBy(e.getCreatedBy());
        r.setUpdatedBy(e.getUpdatedBy());
        return r;
    }

    public void applyRequest(EventRequest req, OperationalRiskEvent e) {
        e.setTitle(req.getTitle());
        e.setDescription(req.getDescription());
        e.setStatus(req.getStatus());
        e.setCategory(req.getCategory());
        e.setSubCategory(req.getSubCategory());
        e.setBusinessUnit(req.getBusinessUnit());
        e.setDepartment(req.getDepartment());
        e.setLocation(req.getLocation());
        e.setImpactType(req.getImpactType());
        e.setLikelihood(req.getLikelihood());
        e.setImpact(req.getImpact());
        e.setResidualRiskScore(req.getResidualRiskScore());
        e.setLossAmount(req.getLossAmount());
        e.setCurrency(req.getCurrency() != null ? req.getCurrency() : "USD");
        e.setIncidentDate(req.getIncidentDate());
        e.setDiscoveryDate(req.getDiscoveryDate());
        e.setClosureDate(req.getClosureDate());
        e.setRootCause(req.getRootCause());
        e.setControlFailures(req.getControlFailures());
        e.setKri(req.getKri());
        e.setActionPlan(req.getActionPlan());
    }
}
