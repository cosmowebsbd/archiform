package com.archiform.domain.invoice;

import com.archiform.util.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "invoice_line_items")
public class InvoiceLineItem extends BaseEntity {


    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity = BigDecimal.ONE;

    @Column(name = "unit_price", nullable = false, precision = 14, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @Column(name = "is_billable", nullable = false)
    private boolean billable = true;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder = 0;

    public InvoiceLineItem() {}

    public Invoice getInvoice() { return invoice; }
    public void setInvoice(Invoice v) { this.invoice = v; }
    public String getDescription() { return description; }
    public void setDescription(String v) { this.description = v; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal v) { this.quantity = v; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal v) { this.unitPrice = v; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal v) { this.amount = v; }
    public boolean isBillable() { return billable; }
    public void setBillable(boolean v) { this.billable = v; }
    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int v) { this.sortOrder = v; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Invoice invoice; private String description;
        private BigDecimal quantity=BigDecimal.ONE, unitPrice, amount;
        private boolean billable=true; private int sortOrder;
        public Builder invoice(Invoice v) { invoice=v; return this; }
        public Builder description(String v) { description=v; return this; }
        public Builder quantity(BigDecimal v) { quantity=v; return this; }
        public Builder unitPrice(BigDecimal v) { unitPrice=v; return this; }
        public Builder amount(BigDecimal v) { amount=v; return this; }
        public Builder billable(boolean v) { billable=v; return this; }
        public Builder sortOrder(int v) { sortOrder=v; return this; }
        public InvoiceLineItem build() {
            InvoiceLineItem li = new InvoiceLineItem();
            li.invoice=invoice; li.description=description; li.quantity=quantity;
            li.unitPrice=unitPrice; li.amount=amount; li.billable=billable; li.sortOrder=sortOrder;
            return li;
        }
    }
}
