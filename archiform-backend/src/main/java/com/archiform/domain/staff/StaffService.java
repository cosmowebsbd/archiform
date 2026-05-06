package com.archiform.domain.staff;

import com.archiform.domain.firm.*;
import com.archiform.domain.project.Phase;
import com.archiform.domain.project.PhaseRepository;
import com.archiform.domain.project.Project;
import com.archiform.domain.project.ProjectRepository;
import com.archiform.domain.user.User;
import com.archiform.domain.user.UserRepository;
import com.archiform.dto.staff.AddStaffInput;
import com.archiform.dto.staff.StaffAssignmentInput;
import com.archiform.dto.staff.UpdateStaffInput;
import com.archiform.exception.ArchiformException;
import com.archiform.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class StaffService {

    private static final Logger log = LoggerFactory.getLogger(StaffService.class);

    private final StaffRepository staffRepository;
    private final StaffAssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final FirmRepository firmRepository;
    private final FirmMemberRepository firmMemberRepository;
    private final ProjectRepository projectRepository;
    private final PhaseRepository phaseRepository;
    private final PasswordEncoder passwordEncoder;

    public StaffService(StaffRepository staffRepository, StaffAssignmentRepository assignmentRepository,
                        UserRepository userRepository, FirmRepository firmRepository,
                        FirmMemberRepository firmMemberRepository, ProjectRepository projectRepository,
                        PhaseRepository phaseRepository, PasswordEncoder passwordEncoder) {
        this.staffRepository = staffRepository;
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
        this.firmRepository = firmRepository;
        this.firmMemberRepository = firmMemberRepository;
        this.projectRepository = projectRepository;
        this.phaseRepository = phaseRepository;
        this.passwordEncoder = passwordEncoder;
    }

    
    @Transactional(readOnly = true)
    public List<StaffMember> getStaffByFirm(UUID firmId) {
        return staffRepository.findByFirmIdAndActiveTrueOrderByCreatedAtAsc(firmId);
    }

    @Transactional(readOnly = true)
    public StaffMember getById(UUID id, UUID firmId) {
        return staffRepository.findByIdAndFirmId(id, firmId)
                .orElseThrow(() -> new ResourceNotFoundException("StaffMember", id));
    }

   
    @Transactional
    public StaffMember addStaffMember(AddStaffInput input, UUID firmId) {
        var firm = firmRepository.findById(firmId)
                .orElseThrow(() -> new ResourceNotFoundException("Firm", firmId));
        User user = userRepository.findByEmail(input.getEmail().toLowerCase())
                .orElseGet(() -> userRepository.save(User.builder()
                        .email(input.getEmail().toLowerCase().trim())
                        .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                        .firstName(input.getFirstName()).lastName(input.getLastName()).build()));
        if (staffRepository.findByFirmIdAndUserId(firmId, user.getId()).isPresent())
            throw new ArchiformException("This person is already a staff member.");
        UserRole role = input.getRole() != null ? input.getRole() : UserRole.MEMBER;
        if (!firmMemberRepository.existsByFirmIdAndUserId(firmId, user.getId()))
            firmMemberRepository.save(FirmMember.builder().firm(firm).user(user).role(role).build());
        return staffRepository.save(StaffMember.builder()
                .firm(firm).user(user).title(input.getTitle()).department(input.getDepartment())
                .hourlyRate(input.getHourlyRate() != null ? input.getHourlyRate() : BigDecimal.ZERO)
                .targetUtilization(input.getTargetUtilization() != null ? input.getTargetUtilization() : 80)
                .build());
    }

    
    @Transactional
    public StaffMember updateStaffMember(UUID id, UpdateStaffInput input, UUID firmId) {
        StaffMember s = getById(id, firmId);
        if (input.getTitle() != null) s.setTitle(input.getTitle());
        if (input.getDepartment() != null) s.setDepartment(input.getDepartment());
        if (input.getHourlyRate() != null) s.setHourlyRate(input.getHourlyRate());
        if (input.getTargetUtilization() != null) s.setTargetUtilization(input.getTargetUtilization());
        return staffRepository.save(s);
    }

    @Transactional
    public StaffAssignment assignStaff(StaffAssignmentInput input, UUID firmId) {
        StaffMember staff = getById(input.getStaffId(), firmId);
        Project project = projectRepository.findByIdAndFirmId(input.getProjectId(), firmId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", input.getProjectId()));
        Phase phase = null;
        if (input.getPhaseId() != null)
            phase = phaseRepository.findById(input.getPhaseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Phase", input.getPhaseId()));
        return assignmentRepository.save(StaffAssignment.builder()
                .staff(staff).project(project).phase(phase)
                .allocatedHours(input.getAllocatedHours() != null ? input.getAllocatedHours() : BigDecimal.ZERO)
                .startDate(input.getStartDate()).endDate(input.getEndDate()).build());
    }
}
