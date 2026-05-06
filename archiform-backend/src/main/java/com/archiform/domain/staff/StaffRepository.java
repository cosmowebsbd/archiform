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

    List<StaffMember> findByFirmIdAndActiveTrueOrderByCreatedAtAsc(UUID firmId);

    Optional<StaffMember> findByIdAndFirmId(UUID id, UUID firmId);

    Optional<StaffMember> findByFirmIdAndUserId(UUID firmId, UUID userId);
}
