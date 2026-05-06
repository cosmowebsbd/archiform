package com.archiform.security;

import com.archiform.domain.user.User;
import com.archiform.domain.user.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String userIdOrEmail) throws UsernameNotFoundException {
        Optional<User> userOpt;
        try {
            userOpt = userRepository.findById(UUID.fromString(userIdOrEmail));
        } catch (IllegalArgumentException e) {
            userOpt = userRepository.findByEmail(userIdOrEmail.toLowerCase().trim());
        }
        User user = userOpt.orElseThrow(() -> new UsernameNotFoundException("User not found: " + userIdOrEmail));
        return new org.springframework.security.core.userdetails.User(
                user.getId().toString(), user.getPasswordHash(), user.isActive(),
                true, true, true, List.of(new SimpleGrantedAuthority("ROLE_USER")));
    }
}
