package com.archiform.graphql;

import com.archiform.domain.firm.Firm;
import com.archiform.dto.user.ChangePasswordInput;
import com.archiform.dto.user.UpdateProfileInput;
import com.archiform.domain.firm.FirmService;
import com.archiform.dto.firm.UpdateFirmInput;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import com.archiform.domain.firm.FirmService;
import com.archiform.domain.user.User;
import com.archiform.domain.user.UserService;
import com.archiform.exception.UnauthorizedException;
import graphql.schema.DataFetchingEnvironment;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import java.util.UUID;

@Controller
public class UserController {
    private final UserService userService;
    private final FirmService firmService;
    
    
    
    public UserController(UserService userService, FirmService firmService) {
        this.userService = userService; this.firmService = firmService;
    }

    @QueryMapping
    public User me() { return userService.getCurrentUser(); }

    @QueryMapping
    public Firm firm(DataFetchingEnvironment env) {
        Object firmId = env.getGraphQlContext().get("firmId");
        if (firmId == null) throw new UnauthorizedException();
        return firmService.getCurrentFirm(UUID.fromString(firmId.toString()));
    }
    
    @MutationMapping
    public User updateProfile(@Argument UpdateProfileInput input, DataFetchingEnvironment env) {
        Object userId = env.getGraphQlContext().get("userId");
        if (userId == null) throw new UnauthorizedException();
        return userService.updateProfile(UUID.fromString(userId.toString()), input);
    }

    @MutationMapping
    public Boolean changePassword(@Argument ChangePasswordInput input, DataFetchingEnvironment env) {
        Object userId = env.getGraphQlContext().get("userId");
        if (userId == null) throw new UnauthorizedException();
        return userService.changePassword(UUID.fromString(userId.toString()), input);
    }

    @MutationMapping
    public com.archiform.domain.firm.Firm updateFirm(
            @Argument UpdateFirmInput input, DataFetchingEnvironment env) {
        Object firmId = env.getGraphQlContext().get("firmId");
        if (firmId == null) throw new UnauthorizedException();
        return firmService.updateFirm(UUID.fromString(firmId.toString()), input);
    }
}
