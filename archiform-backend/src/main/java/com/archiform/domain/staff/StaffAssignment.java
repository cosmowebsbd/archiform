package com.archiform.domain.staff;

import com.archiform.domain.project.Phase;
import com.archiform.domain.project.Project;
import com.archiform.util.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "staff_assignments")
public class StaffAssignment extends BaseEntity {

	@JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "staff_id", nullable = false)
    private StaffMember staff;

	@JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phase_id")
    private Phase phase;

    @Column(name = "allocated_hours", nullable = false, precision = 10, scale = 2)
    private BigDecimal allocatedHours = BigDecimal.ZERO;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    public StaffAssignment() {}

    public StaffMember getStaff() { return staff; }
    public void setStaff(StaffMember v) { this.staff = v; }
    public Project getProject() { return project; }
    public void setProject(Project v) { this.project = v; }
    public Phase getPhase() { return phase; }
    public void setPhase(Phase v) { this.phase = v; }
    public BigDecimal getAllocatedHours() { return allocatedHours; }
    public void setAllocatedHours(BigDecimal v) { this.allocatedHours = v; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate v) { this.startDate = v; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate v) { this.endDate = v; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private StaffMember staff; private Project project; private Phase phase;
        private BigDecimal allocatedHours=BigDecimal.ZERO;
        private LocalDate startDate, endDate;
        public Builder staff(StaffMember v) { staff=v; return this; }
        public Builder project(Project v) { project=v; return this; }
        public Builder phase(Phase v) { phase=v; return this; }
        public Builder allocatedHours(BigDecimal v) { allocatedHours=v; return this; }
        public Builder startDate(LocalDate v) { startDate=v; return this; }
        public Builder endDate(LocalDate v) { endDate=v; return this; }
        public StaffAssignment build() {
            StaffAssignment a = new StaffAssignment();
            a.staff=staff; a.project=project; a.phase=phase;
            a.allocatedHours=allocatedHours; a.startDate=startDate; a.endDate=endDate;
            return a;
        }
    }
}
