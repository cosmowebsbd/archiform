package com.archiform.domain.invoice;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    List<Invoice> findByFirmIdOrderByIssueDateDesc(UUID firmId);

    List<Invoice> findByFirmIdAndStatusOrderByIssueDateDesc(UUID firmId, InvoiceStatus status);

    Optional<Invoice> findByIdAndFirmId(UUID id, UUID firmId);

    @Query("SELECT COALESCE(SUM(i.total), 0) FROM Invoice i " +
           "WHERE i.firm.id = :firmId AND i.status = 'PAID'")
    BigDecimal sumPaidByFirmId(@Param("firmId") UUID firmId);

    @Query("SELECT COALESCE(SUM(i.total), 0) FROM Invoice i " +
           "WHERE i.firm.id = :firmId AND i.status IN ('SENT', 'VIEWED', 'OVERDUE')")
    BigDecimal sumOutstandingByFirmId(@Param("firmId") UUID firmId);

    boolean existsByFirmIdAndInvoiceNumber(UUID firmId, String invoiceNumber);
}
