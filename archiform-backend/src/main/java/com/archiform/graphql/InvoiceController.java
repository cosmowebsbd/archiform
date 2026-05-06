package com.archiform.graphql;

import com.archiform.domain.invoice.Invoice;
import com.archiform.domain.invoice.InvoiceService;
import com.archiform.domain.invoice.InvoiceStatus;
import com.archiform.dto.invoice.CreateInvoiceInput;
import com.archiform.exception.UnauthorizedException;
import graphql.schema.DataFetchingEnvironment;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import java.util.List;
import java.util.UUID;

@Controller
public class InvoiceController {
    private final InvoiceService invoiceService;
    public InvoiceController(InvoiceService invoiceService) { this.invoiceService = invoiceService; }

    @QueryMapping
    public List<Invoice> invoices(@Argument InvoiceStatus status, DataFetchingEnvironment env) {
        UUID firmId = extractFirmId(env);
        return status != null ? invoiceService.getByFirmAndStatus(firmId, status)
                              : invoiceService.getInvoicesByFirm(firmId);
    }
    @QueryMapping
    public Invoice invoice(@Argument String id, DataFetchingEnvironment env) {
        return invoiceService.getById(UUID.fromString(id), extractFirmId(env));
    }
    @MutationMapping
    public Invoice createInvoice(@Argument CreateInvoiceInput input, DataFetchingEnvironment env) {
        return invoiceService.createInvoice(input, extractFirmId(env));
    }
    @MutationMapping
    public Invoice updateInvoiceStatus(@Argument String id, @Argument InvoiceStatus status, DataFetchingEnvironment env) {
        return invoiceService.updateInvoiceStatus(UUID.fromString(id), status, extractFirmId(env));
    }
    @MutationMapping
    public Boolean deleteInvoice(@Argument String id, DataFetchingEnvironment env) {
        return invoiceService.deleteInvoice(UUID.fromString(id), extractFirmId(env));
    }
    private UUID extractFirmId(DataFetchingEnvironment env) {
        Object v = env.getGraphQlContext().get("firmId");
        if (v == null) throw new UnauthorizedException();
        return UUID.fromString(v.toString());
    }
}
