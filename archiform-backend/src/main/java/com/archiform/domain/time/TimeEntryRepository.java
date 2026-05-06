package com.archiform.domain.time;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TimeEntryRepository extends JpaRepository<TimeEntry, UUID> {

    @Query("""
        SELECT t FROM TimeEntry t
        JOIN FETCH t.staff s
        JOIN FETCH s.user
        JOIN FETCH t.project
        WHERE t.firm.id = :firmId
        ORDER BY t.entryDate DESC
        """)
    List<TimeEntry> findByFirmIdOrderByEntryDateDesc(@Param("firmId") UUID firmId);

    @Query("""
        SELECT t FROM TimeEntry t
        JOIN FETCH t.staff s
        JOIN FETCH s.user
        JOIN FETCH t.project
        WHERE t.firm.id = :firmId
        AND t.project.id = :projectId
        ORDER BY t.entryDate DESC
        """)
    List<TimeEntry> findByFirmIdAndProjectIdOrderByEntryDateDesc(
            @Param("firmId") UUID firmId,
            @Param("projectId") UUID projectId);

    @Query("""
        SELECT t FROM TimeEntry t
        JOIN FETCH t.staff s
        JOIN FETCH s.user
        JOIN FETCH t.project
        WHERE t.firm.id = :firmId
        AND t.staff.id = :staffId
        ORDER BY t.entryDate DESC
        """)
    List<TimeEntry> findByFirmIdAndStaffIdOrderByEntryDateDesc(
            @Param("firmId") UUID firmId,
            @Param("staffId") UUID staffId);

    @Query("""
        SELECT t FROM TimeEntry t
        JOIN FETCH t.staff s
        JOIN FETCH s.user
        JOIN FETCH t.project
        WHERE t.firm.id = :firmId
        AND t.entryDate >= :from
        AND t.entryDate <= :to
        ORDER BY t.entryDate DESC
        """)
    List<TimeEntry> findByFirmIdAndDateRange(
            @Param("firmId") UUID firmId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    @Query("""
        SELECT COALESCE(SUM(t.hours), 0)
        FROM TimeEntry t
        WHERE t.firm.id = :firmId
        AND t.entryDate >= :from
        AND t.entryDate <= :to
        """)
    BigDecimal sumHoursByFirmAndDateRange(
            @Param("firmId") UUID firmId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    Optional<TimeEntry> findByIdAndFirmId(UUID id, UUID firmId);
}