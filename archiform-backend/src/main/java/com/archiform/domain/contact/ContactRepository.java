package com.archiform.domain.contact;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContactRepository extends JpaRepository<Contact, UUID> {

    List<Contact> findByFirmIdOrderByNameAsc(UUID firmId);

    Optional<Contact> findByIdAndFirmId(UUID id, UUID firmId);
}
