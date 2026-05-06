package com.archiform.dto.invoice;
import java.math.BigDecimal;
public class LineItemInput {
    private String description; private BigDecimal quantity, unitPrice; private Boolean isBillable;
    public String getDescription() { return description; } public void setDescription(String v) { description=v; }
    public BigDecimal getQuantity() { return quantity; } public void setQuantity(BigDecimal v) { quantity=v; }
    public BigDecimal getUnitPrice() { return unitPrice; } public void setUnitPrice(BigDecimal v) { unitPrice=v; }
    public Boolean getIsBillable() { return isBillable; } public void setIsBillable(Boolean v) { isBillable=v; }
}
