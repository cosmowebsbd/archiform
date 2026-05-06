package com.archiform.dto.invoice;
import java.math.BigDecimal; import java.time.LocalDate; import java.util.List; import java.util.UUID;
public class CreateInvoiceInput {
    private UUID projectId, contactId; private LocalDate issueDate, dueDate;
    private BigDecimal taxRate; private String notes; private List<LineItemInput> lineItems;
    public UUID getProjectId() { return projectId; } public void setProjectId(UUID v) { projectId=v; }
    public UUID getContactId() { return contactId; } public void setContactId(UUID v) { contactId=v; }
    public LocalDate getIssueDate() { return issueDate; } public void setIssueDate(LocalDate v) { issueDate=v; }
    public LocalDate getDueDate() { return dueDate; } public void setDueDate(LocalDate v) { dueDate=v; }
    public BigDecimal getTaxRate() { return taxRate; } public void setTaxRate(BigDecimal v) { taxRate=v; }
    public String getNotes() { return notes; } public void setNotes(String v) { notes=v; }
    public List<LineItemInput> getLineItems() { return lineItems; } public void setLineItems(List<LineItemInput> v) { lineItems=v; }
}
