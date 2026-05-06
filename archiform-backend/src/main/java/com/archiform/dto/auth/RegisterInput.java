package com.archiform.dto.auth;

public class RegisterInput {
    private String email, password, firstName, lastName, firmName, industry, location, howDidYouHear;
    private int employeeCount;
    public String getEmail() { return email; }
    public void setEmail(String v) { this.email = v; }
    public String getPassword() { return password; }
    public void setPassword(String v) { this.password = v; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String v) { this.firstName = v; }
    public String getLastName() { return lastName; }
    public void setLastName(String v) { this.lastName = v; }
    public String getFirmName() { return firmName; }
    public void setFirmName(String v) { this.firmName = v; }
    public String getIndustry() { return industry; }
    public void setIndustry(String v) { this.industry = v; }
    public String getLocation() { return location; }
    public void setLocation(String v) { this.location = v; }
    public String getHowDidYouHear() { return howDidYouHear; }
    public void setHowDidYouHear(String v) { this.howDidYouHear = v; }
    public int getEmployeeCount() { return employeeCount; }
    public void setEmployeeCount(int v) { this.employeeCount = v; }
}
