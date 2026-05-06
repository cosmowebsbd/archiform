package com.archiform.dto.project;
import java.math.BigDecimal; import java.time.LocalDate; import java.util.UUID;
public class CreateProjectInput {
    private String name, description, category;
    private BigDecimal totalBudget; private UUID contactId;
    private LocalDate startDate, endDate;
    public String getName() { return name; } public void setName(String v) { name=v; }
    public String getDescription() { return description; } public void setDescription(String v) { description=v; }
    public String getCategory() { return category; } public void setCategory(String v) { category=v; }
    public BigDecimal getTotalBudget() { return totalBudget; } public void setTotalBudget(BigDecimal v) { totalBudget=v; }
    public UUID getContactId() { return contactId; } public void setContactId(UUID v) { contactId=v; }
    public LocalDate getStartDate() { return startDate; } public void setStartDate(LocalDate v) { startDate=v; }
    public LocalDate getEndDate() { return endDate; } public void setEndDate(LocalDate v) { endDate=v; }
}
