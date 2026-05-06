package com.archiform.domain.user;

import com.archiform.domain.firm.*;
import com.archiform.dto.auth.AuthPayload;
import com.archiform.dto.auth.LoginInput;
import com.archiform.dto.auth.RegisterInput;
import com.archiform.exception.ArchiformException;
import com.archiform.exception.UnauthorizedException;
import com.archiform.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final FirmRepository firmRepository;
    private final FirmMemberRepository firmMemberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository, FirmRepository firmRepository,
                       FirmMemberRepository firmMemberRepository, PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.firmRepository = firmRepository;
        this.firmMemberRepository = firmMemberRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public AuthPayload register(RegisterInput input) {
        if (userRepository.existsByEmail(input.getEmail())) {
            throw new ArchiformException("An account with this email already exists.");
        }
        User user = User.builder()
                .email(input.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(input.getPassword()))
                .firstName(input.getFirstName().trim())
                .lastName(input.getLastName().trim())
                .build();
        user = userRepository.save(user);

        Industry industry;
        try { industry = Industry.valueOf(input.getIndustry() != null ? input.getIndustry() : "ARCHITECTURE"); }
        catch (IllegalArgumentException e) { industry = Industry.ARCHITECTURE; }

        Firm firm = Firm.builder()
                .name(input.getFirmName().trim())
                .industry(industry)
                .employeeCount(Math.max(1, input.getEmployeeCount()))
                .location(input.getLocation())
                .plan(Plan.TRIAL)
                .trialEndsAt(Instant.now().plus(10, ChronoUnit.DAYS))
                .build();
        firm = firmRepository.save(firm);

        firmMemberRepository.save(FirmMember.builder().firm(firm).user(user).role(UserRole.OWNER).build());

        String token = jwtTokenProvider.generateToken(
                user.getId().toString(), firm.getId().toString(), UserRole.OWNER.name());
        log.info("New registration: {} for firm '{}'", user.getEmail(), firm.getName());
        return new AuthPayload(token, user, firm);
    }

    @Transactional(readOnly = true)
    public AuthPayload login(LoginInput input) {
        User user = userRepository.findByEmail(input.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));
        if (!passwordEncoder.matches(input.getPassword(), user.getPasswordHash()))
            throw new UnauthorizedException("Invalid email or password.");
        if (!user.isActive())
            throw new UnauthorizedException("Your account has been deactivated.");

        Firm firm = firmMemberRepository
                .findByUserIdAndActiveTrueOrderByCreatedAtAsc(user.getId())
                .stream().findFirst()
                .map(FirmMember::getFirm)
                .orElseThrow(() -> new ArchiformException("No firm found for this user."));

        UserRole role = firmMemberRepository
                .findRoleByFirmIdAndUserId(firm.getId(), user.getId())
                .orElse(UserRole.MEMBER);

        String token = jwtTokenProvider.generateToken(
                user.getId().toString(), firm.getId().toString(), role.name());
        log.info("User logged in: {}", user.getEmail());
        return new AuthPayload(token, user, firm);
    }
}
