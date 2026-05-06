package com.archiform.dto.auth;

import com.archiform.domain.firm.Firm;
import com.archiform.domain.user.User;

public class AuthPayload {
    private String token;
    private User user;
    private Firm firm;
    public AuthPayload(String token, User user, Firm firm) {
        this.token = token; this.user = user; this.firm = firm;
    }
    public String getToken() { return token; }
    public User getUser() { return user; }
    public Firm getFirm() { return firm; }
}
