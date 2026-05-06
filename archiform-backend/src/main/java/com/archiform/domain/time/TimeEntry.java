package com.archiform.domain.time;

import com.archiform.domain.firm.Firm;
import com.archiform.domain.project.Phase;
import com.archiform.domain.project.Project;
import com.archiform.domain.staff.StaffMember;
import com.archiform.util.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "time_entries")
public class TimeEntry extends BaseEntity {

	@JsonIgnore
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "firm_id", nullable = false)
    private Firm firm;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "staff_id", nullable = false)
    private StaffMember staff;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "phase_id")
    private Phase phase;

    @Column(name = "entry_date", nullable = false)
    private LocalDate entryDate;

    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal hours;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_billable", nullable = false)
    private boolean billable = true;

    public TimeEntry() {}

    public Firm getFirm() { return firm; }
    public void setFirm(Firm v) { this.firm = v; }
    public StaffMember getStaff() { return staff; }
    public void setStaff(StaffMember v) { this.staff = v; }
    public Project getProject() { return project; }
    public void setProject(Project v) { this.project = v; }
    public Phase getPhase() { return phase; }
    public void setPhase(Phase v) { this.phase = v; }
    public LocalDate getEntryDate() { return entryDate; }
    public void setEntryDate(LocalDate v) { this.entryDate = v; }
    public BigDecimal getHours() { return hours; }
    public void setHours(BigDecimal v) { this.hours = v; }
    public String getDescription() { return description; }
    public void setDescription(String v) { this.description = v; }
    public boolean isBillable() { return billable; }
    public void setBillable(boolean v) { this.billable = v; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Firm firm; private StaffMember staff; private Project project;
        private Phase phase; private LocalDate entryDate; private BigDecimal hours;
        private String description; private boolean billable = true;
        public Builder firm(Firm v) { firm=v; return this; }
        public Builder staff(StaffMember v) { staff=v; return this; }
        public Builder project(Project v) { project=v; return this; }
        public Builder phase(Phase v) { phase=v; return this; }
        public Builder entryDate(LocalDate v) { entryDate=v; return this; }
        public Builder hours(BigDecimal v) { hours=v; return this; }
        public Builder description(String v) { description=v; return this; }
        public Builder billable(boolean v) { billable=v; return this; }
        public TimeEntry build() {
            TimeEntry t = new TimeEntry();
            t.firm=firm; t.staff=staff; t.project=project; t.phase=phase;
            t.entryDate=entryDate; t.hours=hours; t.description=description; t.billable=billable;
            return t;
        }
    }
}
