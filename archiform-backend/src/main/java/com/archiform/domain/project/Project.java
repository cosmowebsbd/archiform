package com.archiform.domain.project;

import com.archiform.domain.contact.Contact;
import com.archiform.domain.firm.Firm;
import com.archiform.util.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projects")
public class Project extends BaseEntity {

	@JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "firm_id", nullable = false)
    private Firm firm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contact_id")
    private Contact contact;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ProjectStatus status = ProjectStatus.DRAFT;

    @Column(length = 100)
    private String category;

    @Column(name = "total_budget", nullable = false, precision = 14, scale = 2)
    private BigDecimal totalBudget = BigDecimal.ZERO;

    @Column(name = "spent_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal spentAmount = BigDecimal.ZERO;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("sortOrder ASC")
    private List<Phase> phases = new ArrayList<>();

    public Project() {}

    public Firm getFirm() { return firm; }
    public void setFirm(Firm firm) { this.firm = firm; }
    public Contact getContact() { return contact; }
    public void setContact(Contact contact) { this.contact = contact; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public ProjectStatus getStatus() { return status; }
    public void setStatus(ProjectStatus status) { this.status = status; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public BigDecimal getTotalBudget() { return totalBudget; }
    public void setTotalBudget(BigDecimal totalBudget) { this.totalBudget = totalBudget; }
    public BigDecimal getSpentAmount() { return spentAmount; }
    public void setSpentAmount(BigDecimal spentAmount) { this.spentAmount = spentAmount; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public List<Phase> getPhases() { return phases; }
    public void setPhases(List<Phase> phases) { this.phases = phases; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Firm firm; private Contact contact; private String name, description, category;
        private ProjectStatus status = ProjectStatus.ACTIVE;
        private BigDecimal totalBudget = BigDecimal.ZERO;
        private LocalDate startDate, endDate;
        public Builder firm(Firm v) { firm = v; return this; }
        public Builder contact(Contact v) { contact = v; return this; }
        public Builder name(String v) { name = v; return this; }
        public Builder description(String v) { description = v; return this; }
        public Builder category(String v) { category = v; return this; }
        public Builder status(ProjectStatus v) { status = v; return this; }
        public Builder totalBudget(BigDecimal v) { totalBudget = v; return this; }
        public Builder startDate(LocalDate v) { startDate = v; return this; }
        public Builder endDate(LocalDate v) { endDate = v; return this; }
        public Project build() {
            Project p = new Project();
            p.firm=firm; p.contact=contact; p.name=name; p.description=description;
            p.category=category; p.status=status; p.totalBudget=totalBudget;
            p.startDate=startDate; p.endDate=endDate;
            return p;
        }
    }
}
