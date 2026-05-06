package com.archiform.graphql;

import com.archiform.domain.user.AuthService;
import com.archiform.dto.auth.AuthPayload;
import com.archiform.dto.auth.LoginInput;
import com.archiform.dto.auth.RegisterInput;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

@Controller
public class AuthController {
    private final AuthService authService;
    public AuthController(AuthService authService) { this.authService = authService; }

    @MutationMapping
    public AuthPayload register(@Argument RegisterInput input) { return authService.register(input); }

    @MutationMapping
    public AuthPayload login(@Argument LoginInput input) { return authService.login(input); }
}
