package com.archiform.domain.firm;

import com.archiform.dto.firm.UpdateFirmInput;
import com.archiform.exception.ResourceNotFoundException;
import com.archiform.exception.UnauthorizedException;
import com.archiform.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
public class FirmService {

    private final FirmRepository firmRepository;
    private final FirmMemberRepository firmMemberRepository;

    public FirmService(FirmRepository firmRepository, FirmMemberRepository firmMemberRepository) {
        this.firmRepository = firmRepository;
        this.firmMemberRepository = firmMemberRepository;
    }

    @Transactional(readOnly = true)
    public Firm getCurrentFirm(UUID firmId) {
        return firmRepository.findById(firmId)
                .orElseThrow(() -> new ResourceNotFoundException("Firm", firmId));
    }

    public void verifyMembership(UUID firmId, UUID userId) {
        if (!firmMemberRepository.existsByFirmIdAndUserId(firmId, userId)) {
            throw new UnauthorizedException("You do not have access to this firm.");
        }
    }

    public UserRole getUserRole(UUID firmId, UUID userId) {
        return firmMemberRepository
                .findRoleByFirmIdAndUserId(firmId, userId)
                .orElse(UserRole.MEMBER);
    }

    public static UUID extractUserId() {
        return UUID.fromString(SecurityUtils.requireCurrentUserId());
    }
    
    @Transactional
    public Firm updateFirm(UUID firmId, UpdateFirmInput input) {
        Firm firm = firmRepository.findById(firmId)
                .orElseThrow(() -> new ResourceNotFoundException("Firm", firmId));
        firm.setName(input.getName());
        firm.setIndustry(input.getIndustry());
        firm.setEmployeeCount(input.getEmployeeCount());
        if (input.getLocation() != null) firm.setLocation(input.getLocation());
        return firmRepository.save(firm);
    }
}
