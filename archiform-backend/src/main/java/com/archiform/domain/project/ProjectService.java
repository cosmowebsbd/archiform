package com.archiform.domain.project;

import com.archiform.domain.contact.Contact;
import com.archiform.domain.contact.ContactRepository;
import com.archiform.domain.firm.FirmRepository;
import com.archiform.dto.project.CreateProjectInput;
import com.archiform.dto.project.PhaseInput;
import com.archiform.dto.project.UpdateProjectInput;
import com.archiform.exception.ResourceNotFoundException;
import com.archiform.exception.UnauthorizedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class ProjectService {

    private static final Logger log = LoggerFactory.getLogger(ProjectService.class);

    private final ProjectRepository projectRepository;
    private final PhaseRepository phaseRepository;
    private final FirmRepository firmRepository;
    private final ContactRepository contactRepository;

    public ProjectService(ProjectRepository projectRepository, PhaseRepository phaseRepository,
                          FirmRepository firmRepository, ContactRepository contactRepository) {
        this.projectRepository = projectRepository;
        this.phaseRepository = phaseRepository;
        this.firmRepository = firmRepository;
        this.contactRepository = contactRepository;
    }

    @Transactional(readOnly = true)
    public List<Project> getProjectsByFirm(UUID firmId) {
        log.debug("DB query: projects for firm {}", firmId);
        return projectRepository.findByFirmIdWithPhases(firmId);
    }

    @Transactional(readOnly = true)
    public List<Project> getProjectsByFirmAndStatus(UUID firmId, ProjectStatus status) {
        return projectRepository.findByFirmIdAndStatusOrderByCreatedAtDesc(firmId, status);
    }

    @Transactional(readOnly = true)
    public Project getById(UUID id, UUID firmId) {
        return projectRepository.findByIdAndFirmId(id, firmId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", id));
    }

    @Transactional
    public Project createProject(CreateProjectInput input, UUID firmId) {
        var firm = firmRepository.findById(firmId)
                .orElseThrow(() -> new ResourceNotFoundException("Firm", firmId));
        Contact contact = null;
        if (input.getContactId() != null)
            contact = contactRepository.findByIdAndFirmId(input.getContactId(), firmId)
                    .orElseThrow(() -> new ResourceNotFoundException("Contact", input.getContactId()));
        Project project = Project.builder()
                .firm(firm).contact(contact).name(input.getName())
                .description(input.getDescription()).category(input.getCategory())
                .totalBudget(input.getTotalBudget() != null ? input.getTotalBudget() : BigDecimal.ZERO)
                .status(ProjectStatus.ACTIVE)
                .startDate(input.getStartDate()).endDate(input.getEndDate())
                .build();
        return projectRepository.save(project);
    }

    @Transactional
    public Project updateProject(UUID id, UpdateProjectInput input, UUID firmId) {
        Project project = getById(id, firmId);
        if (input.getName() != null) project.setName(input.getName());
        if (input.getDescription() != null) project.setDescription(input.getDescription());
        if (input.getStatus() != null) project.setStatus(input.getStatus());
        if (input.getCategory() != null) project.setCategory(input.getCategory());
        if (input.getTotalBudget() != null) project.setTotalBudget(input.getTotalBudget());
        if (input.getStartDate() != null) project.setStartDate(input.getStartDate());
        if (input.getEndDate() != null) project.setEndDate(input.getEndDate());
        if (input.getContactId() != null) {
            Contact c = contactRepository.findByIdAndFirmId(input.getContactId(), firmId)
                    .orElseThrow(() -> new ResourceNotFoundException("Contact", input.getContactId()));
            project.setContact(c);
        }
        return projectRepository.save(project);
    }

    @Transactional
    public boolean deleteProject(UUID id, UUID firmId) {
        projectRepository.delete(getById(id, firmId));
        return true;
    }

    @Transactional
    public Phase addPhase(UUID projectId, PhaseInput input, UUID firmId) {
        Project project = getById(projectId, firmId);
        int nextOrder = project.getPhases().size();
        if (input.getSortOrder() != null) nextOrder = input.getSortOrder();
        Phase phase = Phase.builder()
                .project(project).name(input.getName()).description(input.getDescription())
                .budgetHours(input.getBudgetHours() != null ? input.getBudgetHours() : BigDecimal.ZERO)
                .budgetAmount(input.getBudgetAmount() != null ? input.getBudgetAmount() : BigDecimal.ZERO)
                .startDate(input.getStartDate()).endDate(input.getEndDate()).sortOrder(nextOrder)
                .build();
        return phaseRepository.save(phase);
    }

    @Transactional
    public Phase updatePhase(UUID phaseId, PhaseInput input, UUID firmId) {
        Phase phase = phaseRepository.findById(phaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Phase", phaseId));
        if (!phase.getProject().getFirm().getId().equals(firmId))
            throw new UnauthorizedException();
        if (input.getName() != null) phase.setName(input.getName());
        if (input.getDescription() != null) phase.setDescription(input.getDescription());
        if (input.getBudgetHours() != null) phase.setBudgetHours(input.getBudgetHours());
        if (input.getBudgetAmount() != null) phase.setBudgetAmount(input.getBudgetAmount());
        if (input.getStartDate() != null) phase.setStartDate(input.getStartDate());
        if (input.getEndDate() != null) phase.setEndDate(input.getEndDate());
        return phaseRepository.save(phase);
    }
}