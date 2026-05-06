package com.archiform.dto.staff;
import java.math.BigDecimal;
public class UpdateStaffInput {
    private String title, department; private BigDecimal hourlyRate; private Integer targetUtilization;
    public String getTitle() { return title; } public void setTitle(String v) { title=v; }
    public String getDepartment() { return department; } public void setDepartment(String v) { department=v; }
    public BigDecimal getHourlyRate() { return hourlyRate; } public void setHourlyRate(BigDecimal v) { hourlyRate=v; }
    public Integer getTargetUtilization() { return targetUtilization; } public void setTargetUtilization(Integer v) { targetUtilization=v; }
}
