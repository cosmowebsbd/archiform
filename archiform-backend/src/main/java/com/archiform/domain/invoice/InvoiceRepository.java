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

    @Query("""
        SELECT DISTINCT i FROM Invoice i
        LEFT JOIN FETCH i.lineItems
        LEFT JOIN FETCH i.project
        LEFT JOIN FETCH i.contact
        WHERE i.firm.id = :firmId
        ORDER BY i.issueDate DESC
        """)
    List<Invoice> findByFirmIdOrderByIssueDateDesc(@Param("firmId") UUID firmId);

    @Query("""
        SELECT DISTINCT i FROM Invoice i
        LEFT JOIN FETCH i.lineItems
        LEFT JOIN FETCH i.project
        LEFT JOIN FETCH i.contact
        WHERE i.firm.id = :firmId
        AND i.status = :status
        ORDER BY i.issueDate DESC
        """)
    List<Invoice> findByFirmIdAndStatusOrderByIssueDateDesc(
            @Param("firmId") UUID firmId,
            @Param("status") InvoiceStatus status);

    @Query("""
        SELECT DISTINCT i FROM Invoice i
        LEFT JOIN FETCH i.lineItems
        LEFT JOIN FETCH i.project
        LEFT JOIN FETCH i.contact
        WHERE i.id = :id
        AND i.firm.id = :firmId
        """)
    Optional<Invoice> findByIdAndFirmId(
            @Param("id") UUID id,
            @Param("firmId") UUID firmId);

    @Query("""
        SELECT COALESCE(SUM(i.total), 0)
        FROM Invoice i
        WHERE i.firm.id = :firmId
        AND i.status = 'PAID'
        """)
    BigDecimal sumPaidByFirmId(@Param("firmId") UUID firmId);

    boolean existsByFirmIdAndInvoiceNumber(UUID firmId, String invoiceNumber);

    @Query("""
        SELECT COUNT(i) FROM Invoice i
        WHERE i.firm.id = :firmId
        """)
    long countByFirmId(@Param("firmId") UUID firmId);
}