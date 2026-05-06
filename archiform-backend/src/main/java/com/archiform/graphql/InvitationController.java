package com.archiform.graphql;

import com.archiform.domain.firm.UserRole;
import com.archiform.domain.invitation.Invitation;
import com.archiform.domain.invitation.InvitationService;
import com.archiform.domain.user.AuthService;
import com.archiform.domain.user.User;
import com.archiform.dto.auth.AuthPayload;
import com.archiform.exception.UnauthorizedException;
import graphql.schema.DataFetchingEnvironment;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Controller
public class InvitationController {

    private final InvitationService invitationService;
    private final AuthService authService;

    public InvitationController(InvitationService invitationService,
                                  AuthService authService) {
        this.invitationService = invitationService;
        this.authService = authService;
    }

    @QueryMapping
    public List<Invitation> invitations(DataFetchingEnvironment env) {
        UUID firmId = extractFirmId(env);
        return invitationService.getInvitationsByFirm(firmId);
    }

    @QueryMapping
    public Map<String, Object> invitationByToken(@Argument String token) {
        Invitation inv = invitationService.getByToken(token);
        Map<String, Object> info = new HashMap<>();
        info.put("token", inv.getToken());
        info.put("email", inv.getEmail());
        info.put("firstName", inv.getFirstName());
        info.put("firmName", inv.getFirm().getName());
        info.put("inviterName", inv.getInvitedBy().getFirstName()
                + " " + inv.getInvitedBy().getLastName());
        info.put("isExpired", inv.isExpired());
        info.put("isAccepted",
                inv.getStatus().name().equals("ACCEPTED"));
        return info;
    }

    @MutationMapping
    public Invitation sendInvitation(@Argument String email,
                                      @Argument String firstName,
                                      @Argument UserRole role,
                                      DataFetchingEnvironment env) {
        UUID firmId = extractFirmId(env);
        UUID userId = extractUserId(env);
        return invitationService.sendInvitation(
                firmId, userId, email, firstName, role);
    }

    @MutationMapping
    public AuthPayload acceptInvitation(@Argument String token,
                                         @Argument String password,
                                         @Argument String firstName,
                                         @Argument String lastName) {
        User user = invitationService.acceptInvitation(
                token, password, firstName, lastName);
        return authService.loginUser(user);
    }

    @MutationMapping
    public Boolean cancelInvitation(@Argument String id,
                                     DataFetchingEnvironment env) {
        UUID firmId = extractFirmId(env);
        return invitationService.cancelInvitation(
                UUID.fromString(id), firmId);
    }

    private UUID extractFirmId(DataFetchingEnvironment env) {
        Object v = env.getGraphQlContext().get("firmId");
        if (v == null) throw new UnauthorizedException();
        return UUID.fromString(v.toString());
    }

    private UUID extractUserId(DataFetchingEnvironment env) {
        Object v = env.getGraphQlContext().get("userId");
        if (v == null) throw new UnauthorizedException();
        return UUID.fromString(v.toString());
    }
}