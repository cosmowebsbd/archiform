package com.archiform.domain.time;

import com.archiform.domain.firm.FirmRepository;
import com.archiform.domain.project.Phase;
import com.archiform.domain.project.PhaseRepository;
import com.archiform.domain.project.Project;
import com.archiform.domain.project.ProjectRepository;
import com.archiform.domain.staff.StaffMember;
import com.archiform.domain.staff.StaffRepository;
import com.archiform.dto.time.TimeEntryInput;
import com.archiform.exception.ArchiformException;
import com.archiform.exception.ResourceNotFoundException;
import com.archiform.exception.UnauthorizedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class TimeEntryService {

    private static final Logger log = LoggerFactory.getLogger(TimeEntryService.class);

    private final TimeEntryRepository timeEntryRepository;
    private final StaffRepository staffRepository;
    private final ProjectRepository projectRepository;
    private final PhaseRepository phaseRepository;
    private final FirmRepository firmRepository;

    public TimeEntryService(TimeEntryRepository timeEntryRepository, StaffRepository staffRepository,
                            ProjectRepository projectRepository, PhaseRepository phaseRepository,
                            FirmRepository firmRepository) {
        this.timeEntryRepository = timeEntryRepository;
        this.staffRepository = staffRepository;
        this.projectRepository = projectRepository;
        this.phaseRepository = phaseRepository;
        this.firmRepository = firmRepository;
    }

    @Transactional(readOnly = true)
    public List<TimeEntry> getTimeEntries(UUID firmId, UUID projectId, UUID staffId,
                                           LocalDate from, LocalDate to) {
        LocalDate f = from != null ? from : LocalDate.now().minusDays(30);
        LocalDate t = to   != null ? to   : LocalDate.now();
        if (staffId != null)
            return timeEntryRepository.findByStaffIdAndEntryDateBetweenOrderByEntryDateDesc(staffId, f, t);
        if (projectId != null)
            return timeEntryRepository.findByProjectIdOrderByEntryDateDesc(projectId);
        return timeEntryRepository.findByFirmIdAndEntryDateBetweenOrderByEntryDateDesc(firmId, f, t);
    }

    
    @Transactional
    public TimeEntry logTime(TimeEntryInput input, UUID firmId) {
        var firm = firmRepository.findById(firmId)
                .orElseThrow(() -> new ResourceNotFoundException("Firm", firmId));
        StaffMember staff = staffRepository.findByIdAndFirmId(input.getStaffId(), firmId)
                .orElseThrow(() -> new ResourceNotFoundException("StaffMember", input.getStaffId()));
        Project project = projectRepository.findByIdAndFirmId(input.getProjectId(), firmId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", input.getProjectId()));
        Phase phase = null;
        if (input.getPhaseId() != null)
            phase = phaseRepository.findById(input.getPhaseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Phase", input.getPhaseId()));
        if (input.getHours() == null || input.getHours().doubleValue() <= 0)
            throw new ArchiformException("Hours must be greater than 0.");
        return timeEntryRepository.save(TimeEntry.builder()
                .firm(firm).staff(staff).project(project).phase(phase)
                .entryDate(input.getEntryDate() != null ? input.getEntryDate() : LocalDate.now())
                .hours(input.getHours()).description(input.getDescription())
                .billable(input.getIsBillable() != null ? input.getIsBillable() : true)
                .build());
    }

    
    @Transactional
    public TimeEntry updateTimeEntry(UUID id, TimeEntryInput input, UUID firmId) {
        TimeEntry entry = timeEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TimeEntry", id));
        if (!entry.getFirm().getId().equals(firmId)) throw new UnauthorizedException();
        if (input.getHours() != null) entry.setHours(input.getHours());
        if (input.getDescription() != null) entry.setDescription(input.getDescription());
        if (input.getEntryDate() != null) entry.setEntryDate(input.getEntryDate());
        if (input.getIsBillable() != null) entry.setBillable(input.getIsBillable());
        return timeEntryRepository.save(entry);
    }

    
    @Transactional
    public boolean deleteTimeEntry(UUID id, UUID firmId) {
        TimeEntry entry = timeEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TimeEntry", id));
        if (!entry.getFirm().getId().equals(firmId)) throw new UnauthorizedException();
        timeEntryRepository.delete(entry);
        return true;
    }
}
