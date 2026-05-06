package com.archiform.domain.firm;

import com.archiform.domain.user.User;
import com.archiform.util.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;

@Entity
@Table(name = "firm_members")
public class FirmMember extends BaseEntity {

	@JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "firm_id", nullable = false)
    private Firm firm;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role = UserRole.MEMBER;

    @Column(length = 100)
    private String title;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    public FirmMember() {}

    public Firm getFirm() { return firm; }
    public void setFirm(Firm firm) { this.firm = firm; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Firm firm; private User user;
        private UserRole role = UserRole.MEMBER; private String title;
        public Builder firm(Firm v) { this.firm = v; return this; }
        public Builder user(User v) { this.user = v; return this; }
        public Builder role(UserRole v) { this.role = v; return this; }
        public Builder title(String v) { this.title = v; return this; }
        public FirmMember build() {
            FirmMember m = new FirmMember();
            m.firm = firm; m.user = user; m.role = role; m.title = title;
            return m;
        }
    }
}
