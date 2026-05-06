package com.archiform.domain.user;

import com.archiform.dto.user.ChangePasswordInput;
import com.archiform.dto.user.UpdateProfileInput;
import com.archiform.exception.ArchiformException;
import com.archiform.exception.ResourceNotFoundException;
import com.archiform.security.SecurityUtils;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public User getCurrentUser() {
        String userId = SecurityUtils.requireCurrentUserId();
        return userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
    }

    @Transactional(readOnly = true)
    public User getById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }
    
    @Transactional
    public User updateProfile(UUID userId, UpdateProfileInput input) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.setFirstName(input.getFirstName());
        user.setLastName(input.getLastName());
        return userRepository.save(user);
    }

    @Transactional
    public boolean changePassword(UUID userId, ChangePasswordInput input) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        if (!passwordEncoder.matches(input.getCurrentPassword(), user.getPasswordHash()))
            throw new ArchiformException("Current password is incorrect");
        user.setPasswordHash(passwordEncoder.encode(input.getNewPassword()));
        userRepository.save(user);
        return true;
    }
}
