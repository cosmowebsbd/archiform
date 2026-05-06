package com.archiform.domain.contact;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContactRepository extends JpaRepository<Contact, UUID> {

    @Query("""
        SELECT c FROM Contact c
        WHERE c.firm.id = :firmId
        ORDER BY c.name ASC
        """)
    List<Contact> findByFirmIdOrderByName(@Param("firmId") UUID firmId);

    Optional<Contact> findByIdAndFirmId(UUID id, UUID firmId);
}