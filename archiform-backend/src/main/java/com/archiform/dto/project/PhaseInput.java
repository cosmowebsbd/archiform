package com.archiform.dto.project;
import java.math.BigDecimal; import java.time.LocalDate;
public class PhaseInput {
    private String name, description; private BigDecimal budgetHours, budgetAmount;
    private LocalDate startDate, endDate; private Integer sortOrder;
    public String getName() { return name; } public void setName(String v) { name=v; }
    public String getDescription() { return description; } public void setDescription(String v) { description=v; }
    public BigDecimal getBudgetHours() { return budgetHours; } public void setBudgetHours(BigDecimal v) { budgetHours=v; }
    public BigDecimal getBudgetAmount() { return budgetAmount; } public void setBudgetAmount(BigDecimal v) { budgetAmount=v; }
    public LocalDate getStartDate() { return startDate; } public void setStartDate(LocalDate v) { startDate=v; }
    public LocalDate getEndDate() { return endDate; } public void setEndDate(LocalDate v) { endDate=v; }
    public Integer getSortOrder() { return sortOrder; } public void setSortOrder(Integer v) { sortOrder=v; }
}
