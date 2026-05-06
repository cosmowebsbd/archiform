package com.archiform.domain.invoice;

import com.archiform.domain.contact.Contact;
import com.archiform.domain.contact.ContactRepository;
import com.archiform.domain.firm.FirmRepository;
import com.archiform.domain.project.ProjectRepository;
import com.archiform.dto.invoice.CreateInvoiceInput;
import com.archiform.dto.invoice.LineItemInput;
import com.archiform.exception.ResourceNotFoundException;
import com.archiform.exception.UnauthorizedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class InvoiceService {

    private static final Logger log = LoggerFactory.getLogger(InvoiceService.class);

    private final InvoiceRepository invoiceRepository;
    private final FirmRepository firmRepository;
    private final ProjectRepository projectRepository;
    private final ContactRepository contactRepository;

    public InvoiceService(InvoiceRepository invoiceRepository, FirmRepository firmRepository,
                          ProjectRepository projectRepository, ContactRepository contactRepository) {
        this.invoiceRepository = invoiceRepository;
        this.firmRepository = firmRepository;
        this.projectRepository = projectRepository;
        this.contactRepository = contactRepository;
    }

    @Transactional(readOnly = true)
    public List<Invoice> getInvoicesByFirm(UUID firmId) {
        return invoiceRepository.findByFirmIdOrderByIssueDateDesc(firmId);
    }

    @Transactional(readOnly = true)
    public List<Invoice> getByFirmAndStatus(UUID firmId, InvoiceStatus status) {
        return invoiceRepository.findByFirmIdAndStatusOrderByIssueDateDesc(firmId, status);
    }

    @Transactional(readOnly = true)
    public Invoice getById(UUID id, UUID firmId) {
        return invoiceRepository.findByIdAndFirmId(id, firmId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", id));
    }
	/*
	 * @Caching(evict = {
	 * 
	 * @CacheEvict(value = RedisConfig.CACHE_INVOICES, key = "#firmId"),
	 * 
	 * @CacheEvict(value = RedisConfig.CACHE_DASHBOARD, key = "#firmId") })
	 */
    @Transactional
    public Invoice createInvoice(CreateInvoiceInput input, UUID firmId) {
        var firm = firmRepository.findById(firmId)
                .orElseThrow(() -> new ResourceNotFoundException("Firm", firmId));
        var project = projectRepository.findByIdAndFirmId(input.getProjectId(), firmId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", input.getProjectId()));
        Contact contact = null;
        if (input.getContactId() != null)
            contact = contactRepository.findByIdAndFirmId(input.getContactId(), firmId)
                    .orElseThrow(() -> new ResourceNotFoundException("Contact", input.getContactId()));

        String invoiceNumber = generateInvoiceNumber(firmId);
        Invoice invoice = Invoice.builder()
                .firm(firm).project(project).contact(contact)
                .invoiceNumber(invoiceNumber)
                .issueDate(input.getIssueDate()).dueDate(input.getDueDate())
                .taxRate(input.getTaxRate() != null ? input.getTaxRate() : BigDecimal.ZERO)
                .notes(input.getNotes()).build();
        invoice = invoiceRepository.save(invoice);

        List<InvoiceLineItem> items = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        int order = 0;
        for (LineItemInput li : input.getLineItems()) {
            BigDecimal amount = li.getQuantity().multiply(li.getUnitPrice()).setScale(2, RoundingMode.HALF_UP);
            subtotal = subtotal.add(amount);
            InvoiceLineItem lineItem = InvoiceLineItem.builder()
                    .invoice(invoice).description(li.getDescription())
                    .quantity(li.getQuantity()).unitPrice(li.getUnitPrice()).amount(amount)
                    .billable(li.getIsBillable() != null ? li.getIsBillable() : true)
                    .sortOrder(order++).build();
            items.add(lineItem);
        }
        BigDecimal taxAmount = subtotal.multiply(invoice.getTaxRate()).setScale(2, RoundingMode.HALF_UP);
        invoice.setLineItems(items);
        invoice.setSubtotal(subtotal);
        invoice.setTaxAmount(taxAmount);
        invoice.setTotal(subtotal.add(taxAmount));
        return invoiceRepository.save(invoice);
    }

	/*
	 * @Caching(evict = {
	 * 
	 * @CacheEvict(value = RedisConfig.CACHE_INVOICES, key = "#firmId"),
	 * 
	 * @CacheEvict(value = RedisConfig.CACHE_DASHBOARD, key = "#firmId") })
	 */
    @Transactional
    public Invoice updateInvoiceStatus(UUID id, InvoiceStatus status, UUID firmId) {
        Invoice invoice = getById(id, firmId);
        invoice.setStatus(status);
        if (status == InvoiceStatus.PAID) invoice.setPaidAt(java.time.Instant.now());
        return invoiceRepository.save(invoice);
    }

	/*
	 * @Caching(evict = {
	 * 
	 * @CacheEvict(value = RedisConfig.CACHE_INVOICES, key = "#firmId"),
	 * 
	 * @CacheEvict(value = RedisConfig.CACHE_DASHBOARD, key = "#firmId") })
	 */
    @Transactional
    public boolean deleteInvoice(UUID id, UUID firmId) {
        invoiceRepository.delete(getById(id, firmId));
        return true;
    }

    private String generateInvoiceNumber(UUID firmId) {
        String year = String.valueOf(LocalDate.now().getYear());
        long count = invoiceRepository.countByFirmId(firmId) + 1;
        String candidate = "INV-" + year + "-" + String.format("%03d", count);
        int tries = 0;
        while (invoiceRepository.existsByFirmIdAndInvoiceNumber(firmId, candidate) && tries < 100) {
            candidate = "INV-" + year + "-" + String.format("%03d", count + tries + 1);
            tries++;
        }
        return candidate;
    }
}
