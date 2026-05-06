package com.archiform.dto.time;
import java.math.BigDecimal; import java.time.LocalDate; import java.util.UUID;
public class TimeEntryInput {
    private UUID staffId, projectId, phaseId; private LocalDate entryDate;
    private BigDecimal hours; private String description; private Boolean isBillable;
    public UUID getStaffId() { return staffId; } public void setStaffId(UUID v) { staffId=v; }
    public UUID getProjectId() { return projectId; } public void setProjectId(UUID v) { projectId=v; }
    public UUID getPhaseId() { return phaseId; } public void setPhaseId(UUID v) { phaseId=v; }
    public LocalDate getEntryDate() { return entryDate; } public void setEntryDate(LocalDate v) { entryDate=v; }
    public BigDecimal getHours() { return hours; } public void setHours(BigDecimal v) { hours=v; }
    public String getDescription() { return description; } public void setDescription(String v) { description=v; }
    public Boolean getIsBillable() { return isBillable; } public void setIsBillable(Boolean v) { isBillable=v; }
}
