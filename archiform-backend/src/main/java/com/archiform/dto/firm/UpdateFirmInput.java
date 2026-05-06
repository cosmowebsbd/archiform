package com.archiform.dto.firm;

import com.archiform.domain.firm.Industry;

public class UpdateFirmInput {
    private String name;
    private Industry industry;
    private Integer employeeCount;
    private String location;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Industry getIndustry() { return industry; }
    public void setIndustry(Industry industry) { this.industry = industry; }
    public Integer getEmployeeCount() { return employeeCount; }
    public void setEmployeeCount(Integer employeeCount) { this.employeeCount = employeeCount; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
}