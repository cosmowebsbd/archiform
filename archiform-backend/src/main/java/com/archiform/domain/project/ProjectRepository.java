package com.archiform.domain.project;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {

    @Query("""
        SELECT DISTINCT p FROM Project p
        LEFT JOIN FETCH p.phases
        LEFT JOIN FETCH p.contact
        WHERE p.firm.id = :firmId
        ORDER BY p.createdAt DESC
        """)
    List<Project> findByFirmIdWithPhases(@Param("firmId") UUID firmId);

    @Query("""
        SELECT DISTINCT p FROM Project p
        LEFT JOIN FETCH p.phases
        LEFT JOIN FETCH p.contact
        WHERE p.firm.id = :firmId
        AND p.status = :status
        ORDER BY p.createdAt DESC
        """)
    List<Project> findByFirmIdAndStatusOrderByCreatedAtDesc(
            @Param("firmId") UUID firmId,
            @Param("status") ProjectStatus status);

    @Query("""
        SELECT DISTINCT p FROM Project p
        LEFT JOIN FETCH p.phases
        LEFT JOIN FETCH p.contact
        WHERE p.id = :id
        AND p.firm.id = :firmId
        """)
    Optional<Project> findByIdAndFirmId(
            @Param("id") UUID id,
            @Param("firmId") UUID firmId);
}