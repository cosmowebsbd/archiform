package com.archiform.domain.staff;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StaffRepository extends JpaRepository<StaffMember, UUID> {

    @Query("""
        SELECT s FROM StaffMember s
        JOIN FETCH s.user
        WHERE s.firm.id = :firmId
        AND s.active = true
        ORDER BY s.createdAt ASC
        """)
    List<StaffMember> findByFirmIdAndActiveTrueOrderByCreatedAtAsc(
            @Param("firmId") UUID firmId);

    @Query("""
        SELECT s FROM StaffMember s
        JOIN FETCH s.user
        WHERE s.id = :id
        AND s.firm.id = :firmId
        """)
    Optional<StaffMember> findByIdAndFirmId(
            @Param("id") UUID id,
            @Param("firmId") UUID firmId);

    @Query("""
        SELECT s FROM StaffMember s
        JOIN FETCH s.user
        WHERE s.firm.id = :firmId
        AND s.user.id = :userId
        """)
    Optional<StaffMember> findByFirmIdAndUserId(
            @Param("firmId") UUID firmId,
            @Param("userId") UUID userId);
}