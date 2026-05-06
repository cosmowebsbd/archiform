package com.archiform.domain.time;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface TimeEntryRepository extends JpaRepository<TimeEntry, UUID> {

    List<TimeEntry> findByFirmIdAndEntryDateBetweenOrderByEntryDateDesc(
            UUID firmId, LocalDate from, LocalDate to);

    List<TimeEntry> findByStaffIdAndEntryDateBetweenOrderByEntryDateDesc(
            UUID staffId, LocalDate from, LocalDate to);

    List<TimeEntry> findByProjectIdOrderByEntryDateDesc(UUID projectId);

    @Query("SELECT COALESCE(SUM(t.hours), 0) FROM TimeEntry t " +
           "WHERE t.staff.id = :staffId AND t.entryDate BETWEEN :from AND :to")
    java.math.BigDecimal sumHoursByStaffAndDateRange(
            @Param("staffId") UUID staffId,
            @Param("from")    LocalDate from,
            @Param("to")      LocalDate to);

    @Query("SELECT COALESCE(SUM(t.hours), 0) FROM TimeEntry t " +
           "WHERE t.firm.id = :firmId AND t.entryDate BETWEEN :from AND :to")
    java.math.BigDecimal sumHoursByFirmAndDateRange(
            @Param("firmId") UUID firmId,
            @Param("from")   LocalDate from,
            @Param("to")     LocalDate to);
}
