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

    List<Project> findByFirmIdOrderByCreatedAtDesc(UUID firmId);

    List<Project> findByFirmIdAndStatusOrderByCreatedAtDesc(UUID firmId, ProjectStatus status);

    Optional<Project> findByIdAndFirmId(UUID id, UUID firmId);

    long countByFirmIdAndStatus(UUID firmId, ProjectStatus status);

    @Query("SELECT p FROM Project p LEFT JOIN FETCH p.phases WHERE p.firm.id = :firmId " +
           "ORDER BY p.createdAt DESC")
    List<Project> findByFirmIdWithPhases(@Param("firmId") UUID firmId);
}
