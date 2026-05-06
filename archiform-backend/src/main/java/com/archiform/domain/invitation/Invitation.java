package com.archiform.domain.invitation;

import com.archiform.domain.firm.Firm;
import com.archiform.domain.firm.UserRole;
import com.archiform.domain.user.User;
import com.archiform.util.BaseEntity;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "invitations")
public class Invitation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "firm_id", nullable = false)
    private Firm firm;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "invited_by", nullable = false)
    private User invitedBy;

    @Column(nullable = false)
    private String email;

    @Column(name = "first_name")
    private String firstName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role = UserRole.MEMBER;

    @Column(nullable = false, unique = true)
    private String token;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvitationStatus status = InvitationStatus.PENDING;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "accepted_at")
    private Instant acceptedAt;

    public Firm getFirm() { return firm; }
    public void setFirm(Firm firm) { this.firm = firm; }
    public User getInvitedBy() { return invitedBy; }
    public void setInvitedBy(User invitedBy) { this.invitedBy = invitedBy; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public InvitationStatus getStatus() { return status; }
    public void setStatus(InvitationStatus status) { this.status = status; }
    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
    public Instant getAcceptedAt() { return acceptedAt; }
    public void setAcceptedAt(Instant acceptedAt) { this.acceptedAt = acceptedAt; }

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final Invitation inv = new Invitation();
        public Builder firm(Firm f) { inv.firm = f; return this; }
        public Builder invitedBy(User u) { inv.invitedBy = u; return this; }
        public Builder email(String e) { inv.email = e; return this; }
        public Builder firstName(String n) { inv.firstName = n; return this; }
        public Builder role(UserRole r) { inv.role = r; return this; }
        public Builder token(String t) { inv.token = t; return this; }
        public Builder expiresAt(Instant i) { inv.expiresAt = i; return this; }
        public Invitation build() { return inv; }
    }
}