package com.archiform.domain.firm;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FirmMemberRepository extends JpaRepository<FirmMember, UUID> {

    Optional<FirmMember> findByFirmIdAndUserId(UUID firmId, UUID userId);

    List<FirmMember> findByFirmIdAndActiveTrue(UUID firmId);

    // Used in login — find the first firm a user belongs to
    List<FirmMember> findByUserIdAndActiveTrueOrderByCreatedAtAsc(UUID userId);

    @Query("SELECT fm.role FROM FirmMember fm WHERE fm.firm.id = :firmId AND fm.user.id = :userId")
    Optional<UserRole> findRoleByFirmIdAndUserId(@Param("firmId") UUID firmId,
                                                  @Param("userId") UUID userId);

    boolean existsByFirmIdAndUserId(UUID firmId, UUID userId);
    
   
}
