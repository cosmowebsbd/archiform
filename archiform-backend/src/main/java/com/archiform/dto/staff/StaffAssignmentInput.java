package com.archiform.dto.staff;
import java.math.BigDecimal; import java.time.LocalDate; import java.util.UUID;
public class StaffAssignmentInput {
    private UUID staffId, projectId, phaseId; private BigDecimal allocatedHours;
    private LocalDate startDate, endDate;
    public UUID getStaffId() { return staffId; } public void setStaffId(UUID v) { staffId=v; }
    public UUID getProjectId() { return projectId; } public void setProjectId(UUID v) { projectId=v; }
    public UUID getPhaseId() { return phaseId; } public void setPhaseId(UUID v) { phaseId=v; }
    public BigDecimal getAllocatedHours() { return allocatedHours; } public void setAllocatedHours(BigDecimal v) { allocatedHours=v; }
    public LocalDate getStartDate() { return startDate; } public void setStartDate(LocalDate v) { startDate=v; }
    public LocalDate getEndDate() { return endDate; } public void setEndDate(LocalDate v) { endDate=v; }
}
