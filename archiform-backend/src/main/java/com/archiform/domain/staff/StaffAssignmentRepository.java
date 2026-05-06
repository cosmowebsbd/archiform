package com.archiform.domain.staff;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StaffAssignmentRepository extends JpaRepository<StaffAssignment, UUID> {

    List<StaffAssignment> findByStaffId(UUID staffId);

    List<StaffAssignment> findByProjectId(UUID projectId);
}
