package com.archiform.domain.firm;

import com.archiform.util.BaseEntity;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "firms")
public class Firm extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Industry industry = Industry.ARCHITECTURE;

    @Column(name = "employee_count", nullable = false)
    private int employeeCount = 1;

    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Plan plan = Plan.TRIAL;

    @Column(name = "trial_ends_at")
    private Instant trialEndsAt;

    @Column(name = "logo_url")
    private String logoUrl;

    public Firm() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Industry getIndustry() { return industry; }
    public void setIndustry(Industry industry) { this.industry = industry; }
    public int getEmployeeCount() { return employeeCount; }
    public void setEmployeeCount(int employeeCount) { this.employeeCount = employeeCount; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public Plan getPlan() { return plan; }
    public void setPlan(Plan plan) { this.plan = plan; }
    public Instant getTrialEndsAt() { return trialEndsAt; }
    public void setTrialEndsAt(Instant trialEndsAt) { this.trialEndsAt = trialEndsAt; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private String name, location, logoUrl;
        private Industry industry = Industry.ARCHITECTURE;
        private int employeeCount = 1;
        private Plan plan = Plan.TRIAL;
        private Instant trialEndsAt;
        public Builder name(String v) { this.name = v; return this; }
        public Builder location(String v) { this.location = v; return this; }
        public Builder logoUrl(String v) { this.logoUrl = v; return this; }
        public Builder industry(Industry v) { this.industry = v; return this; }
        public Builder employeeCount(int v) { this.employeeCount = v; return this; }
        public Builder plan(Plan v) { this.plan = v; return this; }
        public Builder trialEndsAt(Instant v) { this.trialEndsAt = v; return this; }
        public Firm build() {
            Firm f = new Firm();
            f.name = name; f.location = location; f.logoUrl = logoUrl;
            f.industry = industry; f.employeeCount = employeeCount;
            f.plan = plan; f.trialEndsAt = trialEndsAt;
            return f;
        }
    }
}
