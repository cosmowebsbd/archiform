package com.archiform.domain.invitation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvitationRepository extends JpaRepository<Invitation, UUID> {

    Optional<Invitation> findByToken(String token);

    @Query("""
        SELECT i FROM Invitation i
        WHERE i.firm.id = :firmId
        ORDER BY i.createdAt DESC
        """)
    List<Invitation> findByFirmIdOrderByCreatedAtDesc(
            @Param("firmId") UUID firmId);

    boolean existsByFirmIdAndEmailAndStatus(
            UUID firmId, String email, InvitationStatus status);

    Optional<Invitation> findByEmailAndFirmId(String email, UUID firmId);
}