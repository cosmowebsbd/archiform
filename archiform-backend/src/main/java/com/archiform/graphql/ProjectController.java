package com.archiform.graphql;

import com.archiform.domain.project.*;
import com.archiform.dto.project.CreateProjectInput;
import com.archiform.dto.project.PhaseInput;
import com.archiform.dto.project.UpdateProjectInput;
import com.archiform.exception.UnauthorizedException;
import graphql.schema.DataFetchingEnvironment;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Controller
public class ProjectController {
    private final ProjectService projectService;
    public ProjectController(ProjectService projectService) { this.projectService = projectService; }

    @QueryMapping
    @Transactional(readOnly = true)
    public List<Project> projects(@Argument ProjectStatus status,
                                   DataFetchingEnvironment env) {
        UUID firmId = extractFirmId(env);
        return status != null
            ? projectService.getProjectsByFirmAndStatus(firmId, status)
            : projectService.getProjectsByFirm(firmId);
    }
    @QueryMapping
    @Transactional(readOnly = true)
    public Project project(@Argument String id, DataFetchingEnvironment env) {
        return projectService.getById(UUID.fromString(id), extractFirmId(env));
    }
    @MutationMapping
    public Project createProject(@Argument CreateProjectInput input, DataFetchingEnvironment env) {
        return projectService.createProject(input, extractFirmId(env));
    }
    @MutationMapping
    public Project updateProject(@Argument String id, @Argument UpdateProjectInput input, DataFetchingEnvironment env) {
        return projectService.updateProject(UUID.fromString(id), input, extractFirmId(env));
    }
    @MutationMapping
    public Boolean deleteProject(@Argument String id, DataFetchingEnvironment env) {
        return projectService.deleteProject(UUID.fromString(id), extractFirmId(env));
    }
    @MutationMapping
    public Phase addPhase(@Argument String projectId, @Argument PhaseInput input, DataFetchingEnvironment env) {
        return projectService.addPhase(UUID.fromString(projectId), input, extractFirmId(env));
    }
    @MutationMapping
    public Phase updatePhase(@Argument String id, @Argument PhaseInput input, DataFetchingEnvironment env) {
        return projectService.updatePhase(UUID.fromString(id), input, extractFirmId(env));
    }
    private UUID extractFirmId(DataFetchingEnvironment env) {
        Object v = env.getGraphQlContext().get("firmId");
        if (v == null) throw new UnauthorizedException();
        return UUID.fromString(v.toString());
    }
}
