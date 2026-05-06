package com.archiform.domain.project;

import com.archiform.util.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "phases")
public class Phase extends BaseEntity {

	@JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PhaseStatus status = PhaseStatus.NOT_STARTED;

    @Column(name = "budget_hours", nullable = false, precision = 10, scale = 2)
    private BigDecimal budgetHours = BigDecimal.ZERO;

    @Column(name = "logged_hours", nullable = false, precision = 10, scale = 2)
    private BigDecimal loggedHours = BigDecimal.ZERO;

    @Column(name = "budget_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal budgetAmount = BigDecimal.ZERO;

    @Column(name = "spent_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal spentAmount = BigDecimal.ZERO;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder = 0;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    public Phase() {}

    public Project getProject() { return project; }
    public void setProject(Project p) { this.project = p; }
    public String getName() { return name; }
    public void setName(String v) { this.name = v; }
    public String getDescription() { return description; }
    public void setDescription(String v) { this.description = v; }
    public PhaseStatus getStatus() { return status; }
    public void setStatus(PhaseStatus v) { this.status = v; }
    public BigDecimal getBudgetHours() { return budgetHours; }
    public void setBudgetHours(BigDecimal v) { this.budgetHours = v; }
    public BigDecimal getLoggedHours() { return loggedHours; }
    public void setLoggedHours(BigDecimal v) { this.loggedHours = v; }
    public BigDecimal getBudgetAmount() { return budgetAmount; }
    public void setBudgetAmount(BigDecimal v) { this.budgetAmount = v; }
    public BigDecimal getSpentAmount() { return spentAmount; }
    public void setSpentAmount(BigDecimal v) { this.spentAmount = v; }
    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int v) { this.sortOrder = v; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate v) { this.startDate = v; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate v) { this.endDate = v; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Project project; private String name, description;
        private BigDecimal budgetHours=BigDecimal.ZERO, budgetAmount=BigDecimal.ZERO;
        private LocalDate startDate, endDate; private int sortOrder;
        public Builder project(Project v) { project=v; return this; }
        public Builder name(String v) { name=v; return this; }
        public Builder description(String v) { description=v; return this; }
        public Builder budgetHours(BigDecimal v) { budgetHours=v; return this; }
        public Builder budgetAmount(BigDecimal v) { budgetAmount=v; return this; }
        public Builder startDate(LocalDate v) { startDate=v; return this; }
        public Builder endDate(LocalDate v) { endDate=v; return this; }
        public Builder sortOrder(int v) { sortOrder=v; return this; }
        public Phase build() {
            Phase p = new Phase();
            p.project=project; p.name=name; p.description=description;
            p.budgetHours=budgetHours; p.budgetAmount=budgetAmount;
            p.startDate=startDate; p.endDate=endDate; p.sortOrder=sortOrder;
            return p;
        }
    }
}
