package com.archiform.graphql;

import com.archiform.domain.staff.*;
import com.archiform.dto.staff.AddStaffInput;
import com.archiform.dto.staff.StaffAssignmentInput;
import com.archiform.dto.staff.UpdateStaffInput;
import com.archiform.exception.UnauthorizedException;
import graphql.schema.DataFetchingEnvironment;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import java.util.List;
import java.util.UUID;

@Controller
public class StaffController {
    private final StaffService staffService;
    public StaffController(StaffService staffService) { this.staffService = staffService; }

    @QueryMapping
    public List<StaffMember> staff(DataFetchingEnvironment env) { return staffService.getStaffByFirm(extractFirmId(env)); }
    @QueryMapping
    public StaffMember staffMember(@Argument String id, DataFetchingEnvironment env) {
        return staffService.getById(UUID.fromString(id), extractFirmId(env));
    }
    @MutationMapping
    public StaffMember addStaffMember(@Argument AddStaffInput input, DataFetchingEnvironment env) {
        return staffService.addStaffMember(input, extractFirmId(env));
    }
    @MutationMapping
    public StaffMember updateStaffMember(@Argument String id, @Argument UpdateStaffInput input, DataFetchingEnvironment env) {
        return staffService.updateStaffMember(UUID.fromString(id), input, extractFirmId(env));
    }
    @MutationMapping
    public StaffAssignment assignStaff(@Argument StaffAssignmentInput input, DataFetchingEnvironment env) {
        return staffService.assignStaff(input, extractFirmId(env));
    }
    private UUID extractFirmId(DataFetchingEnvironment env) {
        Object v = env.getGraphQlContext().get("firmId");
        if (v == null) throw new UnauthorizedException();
        return UUID.fromString(v.toString());
    }
}
