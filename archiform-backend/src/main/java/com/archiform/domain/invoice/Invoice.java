package com.archiform.domain.invoice;

import com.archiform.domain.contact.Contact;
import com.archiform.domain.firm.Firm;
import com.archiform.domain.project.Project;
import com.archiform.util.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "invoices")
public class Invoice extends BaseEntity {

	@JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "firm_id", nullable = false)
    private Firm firm;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contact_id")
    private Contact contact;

    @Column(name = "invoice_number", nullable = false, length = 50)
    private String invoiceNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InvoiceStatus status = InvoiceStatus.DRAFT;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "tax_rate", nullable = false, precision = 5, scale = 4)
    private BigDecimal taxRate = BigDecimal.ZERO;

    @Column(name = "tax_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "paid_at")
    private Instant paidAt;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<InvoiceLineItem> lineItems = new ArrayList<>();

    public Invoice() {}

    public Firm getFirm() { return firm; }
    public void setFirm(Firm v) { this.firm = v; }
    public Project getProject() { return project; }
    public void setProject(Project v) { this.project = v; }
    public Contact getContact() { return contact; }
    public void setContact(Contact v) { this.contact = v; }
    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String v) { this.invoiceNumber = v; }
    public InvoiceStatus getStatus() { return status; }
    public void setStatus(InvoiceStatus v) { this.status = v; }
    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate v) { this.issueDate = v; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate v) { this.dueDate = v; }
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal v) { this.subtotal = v; }
    public BigDecimal getTaxRate() { return taxRate; }
    public void setTaxRate(BigDecimal v) { this.taxRate = v; }
    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal v) { this.taxAmount = v; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal v) { this.total = v; }
    public String getNotes() { return notes; }
    public void setNotes(String v) { this.notes = v; }
    public Instant getPaidAt() { return paidAt; }
    public void setPaidAt(Instant v) { this.paidAt = v; }
    public List<InvoiceLineItem> getLineItems() { return lineItems; }
    public void setLineItems(List<InvoiceLineItem> v) { this.lineItems = v; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Firm firm; private Project project; private Contact contact;
        private String invoiceNumber, notes;
        private LocalDate issueDate, dueDate;
        private BigDecimal taxRate = BigDecimal.ZERO;
        public Builder firm(Firm v) { firm=v; return this; }
        public Builder project(Project v) { project=v; return this; }
        public Builder contact(Contact v) { contact=v; return this; }
        public Builder invoiceNumber(String v) { invoiceNumber=v; return this; }
        public Builder notes(String v) { notes=v; return this; }
        public Builder issueDate(LocalDate v) { issueDate=v; return this; }
        public Builder dueDate(LocalDate v) { dueDate=v; return this; }
        public Builder taxRate(BigDecimal v) { taxRate=v; return this; }
        public Invoice build() {
            Invoice i = new Invoice();
            i.firm=firm; i.project=project; i.contact=contact;
            i.invoiceNumber=invoiceNumber; i.notes=notes;
            i.issueDate=issueDate; i.dueDate=dueDate; i.taxRate=taxRate;
            return i;
        }
    }
}
