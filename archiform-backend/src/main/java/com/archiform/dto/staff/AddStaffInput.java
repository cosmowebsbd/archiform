package com.archiform.dto.staff;
import com.archiform.domain.firm.UserRole; import java.math.BigDecimal;
public class AddStaffInput {
    private String email, firstName, lastName, title, department;
    private BigDecimal hourlyRate; private Integer targetUtilization; private UserRole role;
    public String getEmail() { return email; } public void setEmail(String v) { email=v; }
    public String getFirstName() { return firstName; } public void setFirstName(String v) { firstName=v; }
    public String getLastName() { return lastName; } public void setLastName(String v) { lastName=v; }
    public String getTitle() { return title; } public void setTitle(String v) { title=v; }
    public String getDepartment() { return department; } public void setDepartment(String v) { department=v; }
    public BigDecimal getHourlyRate() { return hourlyRate; } public void setHourlyRate(BigDecimal v) { hourlyRate=v; }
    public Integer getTargetUtilization() { return targetUtilization; } public void setTargetUtilization(Integer v) { targetUtilization=v; }
    public UserRole getRole() { return role; } public void setRole(UserRole v) { role=v; }
}
