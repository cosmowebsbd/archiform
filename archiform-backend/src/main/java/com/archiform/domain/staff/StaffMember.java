package com.archiform.domain.staff;

import com.archiform.domain.firm.Firm;
import com.archiform.domain.user.User;
import com.archiform.util.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "staff_members")
public class StaffMember extends BaseEntity {

	@JsonIgnore
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "firm_id", nullable = false)
    private Firm firm;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(length = 100)
    private String title;

    @Column(length = 100)
    private String department;

    @Column(name = "hourly_rate", nullable = false, precision = 10, scale = 2)
    private BigDecimal hourlyRate = BigDecimal.ZERO;

    @Column(name = "target_utilization", nullable = false)
    private int targetUtilization = 80;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    public StaffMember() {}

    public Firm getFirm() { return firm; }
    public void setFirm(Firm v) { this.firm = v; }
    public User getUser() { return user; }
    public void setUser(User v) { this.user = v; }
    public String getTitle() { return title; }
    public void setTitle(String v) { this.title = v; }
    public String getDepartment() { return department; }
    public void setDepartment(String v) { this.department = v; }
    public BigDecimal getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(BigDecimal v) { this.hourlyRate = v; }
    public int getTargetUtilization() { return targetUtilization; }
    public void setTargetUtilization(int v) { this.targetUtilization = v; }
    public boolean isActive() { return active; }
    public void setActive(boolean v) { this.active = v; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Firm firm; private User user; private String title, department;
        private BigDecimal hourlyRate = BigDecimal.ZERO; private int targetUtilization = 80;
        public Builder firm(Firm v) { firm=v; return this; }
        public Builder user(User v) { user=v; return this; }
        public Builder title(String v) { title=v; return this; }
        public Builder department(String v) { department=v; return this; }
        public Builder hourlyRate(BigDecimal v) { hourlyRate=v; return this; }
        public Builder targetUtilization(int v) { targetUtilization=v; return this; }
        public StaffMember build() {
            StaffMember s = new StaffMember();
            s.firm=firm; s.user=user; s.title=title; s.department=department;
            s.hourlyRate=hourlyRate; s.targetUtilization=targetUtilization;
            return s;
        }
    }
}
