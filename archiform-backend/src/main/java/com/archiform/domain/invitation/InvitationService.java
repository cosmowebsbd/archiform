package com.archiform.domain.invitation;

import com.archiform.domain.firm.Firm;
import com.archiform.domain.firm.FirmMember;
import com.archiform.domain.firm.FirmMemberRepository;
import com.archiform.domain.firm.FirmRepository;
import com.archiform.domain.firm.UserRole;
import com.archiform.domain.staff.StaffMember;
import com.archiform.domain.staff.StaffRepository;
import com.archiform.domain.user.User;
import com.archiform.domain.user.UserRepository;
import com.archiform.exception.ArchiformException;
import com.archiform.exception.ResourceNotFoundException;
import com.archiform.service.EmailService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
public class InvitationService {

    private final InvitationRepository invitationRepository;
    private final FirmRepository firmRepository;
    private final UserRepository userRepository;
    private final FirmMemberRepository firmMemberRepository;
    private final StaffRepository staffRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public InvitationService(InvitationRepository invitationRepository,
                              FirmRepository firmRepository,
                              UserRepository userRepository,
                              FirmMemberRepository firmMemberRepository,
                              StaffRepository staffRepository,
                              EmailService emailService,
                              PasswordEncoder passwordEncoder) {
        this.invitationRepository = invitationRepository;
        this.firmRepository = firmRepository;
        this.userRepository = userRepository;
        this.firmMemberRepository = firmMemberRepository;
        this.staffRepository = staffRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Invitation sendInvitation(UUID firmId, UUID invitedByUserId,
                                      String email, String firstName,
                                      UserRole role) {
        Firm firm = firmRepository.findById(firmId)
                .orElseThrow(() -> new ResourceNotFoundException("Firm", firmId));
        User invitedBy = userRepository.findById(invitedByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", invitedByUserId));

        String normalizedEmail = email.toLowerCase().trim();

        // Check if already a member
        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            User existingUser = userRepository.findByEmail(normalizedEmail).get();
            if (firmMemberRepository.existsByFirmIdAndUserId(firmId, existingUser.getId())) {
                throw new ArchiformException("This person is already a member of your firm.");
            }
        }

        // Check for pending invitation
        if (invitationRepository.existsByFirmIdAndEmailAndStatus(
                firmId, normalizedEmail, InvitationStatus.PENDING)) {
            throw new ArchiformException(
                    "An invitation has already been sent to " + normalizedEmail);
        }

        String token = UUID.randomUUID().toString().replace("-", "") +
                       UUID.randomUUID().toString().replace("-", "");

        Invitation invitation = Invitation.builder()
                .firm(firm)
                .invitedBy(invitedBy)
                .email(normalizedEmail)
                .firstName(firstName)
                .role(role != null ? role : UserRole.MEMBER)
                .token(token)
                .expiresAt(Instant.now().plus(7, ChronoUnit.DAYS))
                .build();

        invitation = invitationRepository.save(invitation);

        // Send email
        emailService.sendInvitationEmail(
                normalizedEmail,
                firstName,
                firm.getName(),
                invitedBy.getFirstName() + " " + invitedBy.getLastName(),
                token
        );

        return invitation;
    }

    @Transactional(readOnly = true)
    public Invitation getByToken(String token) {
        return invitationRepository.findByToken(token)
                .orElseThrow(() -> new ArchiformException("Invalid or expired invitation."));
    }

    @Transactional
    public User acceptInvitation(String token, String password,
                                  String firstName, String lastName) {
        Invitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new ArchiformException("Invalid invitation token."));

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new ArchiformException("This invitation has already been used.");
        }

        if (invitation.isExpired()) {
            invitation.setStatus(InvitationStatus.EXPIRED);
            invitationRepository.save(invitation);
            throw new ArchiformException("This invitation has expired.");
        }

        Firm firm = invitation.getFirm();

        // Find or create user
        User user = userRepository.findByEmail(invitation.getEmail())
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(invitation.getEmail());
                    newUser.setFirstName(firstName != null ? firstName :
                            (invitation.getFirstName() != null ?
                             invitation.getFirstName() : "New"));
                    newUser.setLastName(lastName != null ? lastName : "User");
                    newUser.setPasswordHash(passwordEncoder.encode(password));
                    return userRepository.save(newUser);
                });

        // Add to firm members
        if (!firmMemberRepository.existsByFirmIdAndUserId(firm.getId(), user.getId())) {
            FirmMember member = new FirmMember();
            member.setFirm(firm);
            member.setUser(user);
            member.setRole(invitation.getRole());
            firmMemberRepository.save(member);
        }

        // Add as staff member
        if (staffRepository.findByFirmIdAndUserId(firm.getId(), user.getId()).isEmpty()) {
            StaffMember staff = new StaffMember();
            staff.setFirm(firm);
            staff.setUser(user);
            staff.setHourlyRate(BigDecimal.ZERO);
            staff.setTargetUtilization(80);
            staffRepository.save(staff);
        }

        // Mark invitation as accepted
        invitation.setStatus(InvitationStatus.ACCEPTED);
        invitation.setAcceptedAt(Instant.now());
        invitationRepository.save(invitation);

        return user;
    }

    @Transactional
    public boolean cancelInvitation(UUID invitationId, UUID firmId) {
        Invitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Invitation", invitationId));
        if (!invitation.getFirm().getId().equals(firmId))
            throw new ArchiformException("Not authorized.");
        invitation.setStatus(InvitationStatus.CANCELLED);
        invitationRepository.save(invitation);
        return true;
    }

    @Transactional(readOnly = true)
    public List<Invitation> getInvitationsByFirm(UUID firmId) {
        return invitationRepository.findByFirmIdOrderByCreatedAtDesc(firmId);
    }
}